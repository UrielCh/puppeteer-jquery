import { setupJQuery, BrowserEx, PageEx } from '..';
import pc from 'picocolors';

async function run() { 
    const browser: BrowserEx = await setupJQuery({
        headless: true,
        args: [],
    });
    const jqPage: PageEx = await browser.newPage();
    await jqPage.goto('https://github.com/UrielCh/puppeteer-jquery', { waitUntil: 'networkidle2' });

    const stars: string = await jqPage.jQuery('#repo-stars-counter-star').text();
    console.log(`my project is only ${pc.yellow(stars)}⭐`);
    const files = await jqPage.jQuery('div[aria-labelledby="files"] > div[role="row"].Box-row')
        .map((id: number, elm: HTMLElement) => {
             const div = jQuery(elm);
             const icon = (div.find('[role="gridcell"] [aria-label]:first').attr('aria-label') || '').trim();
             const filename = (div.find('div[role="rowheader"]').text() || '').trim();
             const lastChange = (div.find('[role="gridcell"]:last').text() || '').trim();
             return {icon, filename, lastChange};
        }).pojo<{icon: string, filename: string, lastChange: string}>();
    for (const file of files) {
        console.log(`file ${pc.green(file.filename)} is ${file.icon} had been change ${file.lastChange} `);
    }
    browser.close()
}
run();