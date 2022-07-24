import puppeteer from "puppeteer-extra";
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha';


class DlProtect {
    private browser;

    constructor() {
        puppeteer.use(
            RecaptchaPlugin({
                provider: {
                    id: '2captcha',
                    token: (process.env.TWOCAPTCHA_TOKEN as string),
                }
            })
        )
    }

    async getDownloadLink(protectLink: string): Promise<string | null> {
        await this.initBrowser();

        const page = await this.browser.newPage();
        await page.setBypassCSP(false);

        await page.goto(protectLink);
        await page.evaluate(`document.querySelector("button[class='g-recaptcha']").click()`)
        await page.solveRecaptchas()

        const link = await page.waitForSelector('a[rel="external nofollow"]')
        const url = await page.evaluate(link => link.href, link)

        await new Promise(resolve => setTimeout(resolve, 3000));
        this.browser.close()

        return url ?? null;
    }

    private async initBrowser() {
        this.browser = await puppeteer.launch({
            headless: true
        });
    }
}


export default DlProtect
