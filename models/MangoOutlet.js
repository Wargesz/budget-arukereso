import { randomInt } from 'node:crypto';
import {config} from '../configuration/config.js'
import { getImagesWithDoubleAnchorTagAsync, sleep } from '../services/ImageScraperService.js';


const mangoOutletWebsite = config.websites["mangoOutlet"];
const filters = config.filters;

const searchTags = ["noi", "ferfi", "teen", "gyerek"];
const buttonTags = ["noi", "ferfi", "girl", "boy","little_girl", "little_boy"]

const randomTag = searchTags[randomInt(searchTags.length)];

function getRandomTag(){
    let button;
    switch(randomTag){
        case "teen":
            button = Math.random() < 0.5 ? "girl" : "boy";
            break;
        case "gyerek":
            button = Math.random() < 0.5 ? "little_girl" : "little_boy";
            break;
        default:
            button = randomTag;
    }

    const findCategory = (element) => element === button;

    return buttonTags.findIndex(findCategory) + 1;
}

function encodeSearchItemWithFilteringAsync(url, searchword, filters = {}){
    const params = [];

    if(searchword){
        params.push(encodeURIComponent(`${searchword}`));
    }

    if(filters.minPrice && filters.maxPrice){
        params.push(`range=${filters.minPrice}.00-${filters.maxPrice}.00`);
    }

    if(filters.size){
        params.push(`filters=sizes~${filters.size}`);
    }
    const queryString = params.join('&');
    return `${url}?q=${queryString}`;
}

async function clickGenderSelectionButtonAsync(page, randomCategorySelector){
    try{
        await page.$eval(`ul.BrandsWithResultsLinks_brandsList__yJKez > li:nth-child(${randomCategorySelector}) a`, el => el.click());
    }catch(error){
        console.error(`Failed to click gender selection button reverting to default selector...`);
        await page.$eval('ul.BrandsWithResultsLinks_brandsList__yJKez > li a', el=> el.click());
    }
}

async function clickCookieButton(page, selector){
    await page.$eval(selector, el => el.click());
}


export async function fetchMangoOutletImagesAsync(searchword, page, pagesToFetch){

    const randomizedUrl = `${mangoOutletWebsite.baseUrl}/${randomTag}`;
    const foundPage = encodeSearchItemWithFilteringAsync(randomizedUrl, searchword, filters);
    console.log(foundPage);
    await page.goto(foundPage, { waitUntil: "networkidle2" });
    await clickCookieButton(page, '.ButtonBase_button__SOIgU.textActionM_className__8McJk.CookiesFooter_button__l_Uzv.ButtonSecondary_default__LzUq_');
    await clickGenderSelectionButtonAsync(page, getRandomTag())
    await page.waitForNavigation(mangoOutletWebsite.containerSelector, {timeout: 5000});
    const regex = /(\d[\d\s]*)\s*(?!.*\d[\d\s]*\s*)/;

    const images = await getImagesWithDoubleAnchorTagAsync(page, mangoOutletWebsite.containerSelector, mangoOutletWebsite.elementSelector, mangoOutletWebsite.productPriceSelector, mangoOutletWebsite.titleContentSelector, regex);
   
    const selected = images.slice(0, pagesToFetch);
    
    const finalImages = {
        websiteName: "mangoOutlet",
        images: selected
    };

    return finalImages;
}

