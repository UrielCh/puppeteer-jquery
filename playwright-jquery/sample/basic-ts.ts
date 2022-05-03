import { setupJQuery } from 'playwright-jquery';

(async () => {
    let browser = await setupJQuery({ headless: false });
    let page = await browser.newPage();
    await page.jQuery('body').append(`<h1>Title</h1> <div><h3>sub-title <i>X</i><h3> <h4>h4</h4></div>`);
    // get the H1 value
    let title = await page.jQuery('h1').text();
    // chain calls
    let text = await page.jQuery('body i:last')
        .closest('div')
        .find('h3')
        .css('color', 'yellow')
        .parent()
        .find(':last')
        .text();
    console.log('this page contains H1:', title);
    console.log('last h4 contains', text);
})();