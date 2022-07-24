import axios, {AxiosInstance} from "axios";
import {sleep} from "../utils";
import Logger from "./Logger";


class Uptobox {
    private client: AxiosInstance;
    private readonly token: string;
    private readonly logger: Function;

    constructor(token: string) {
        this.token = token
        this.client = axios.create({
            baseURL: "https://uptobox.com/api/",
            params: {
                token: this.token
            }
        })

        this.logger = Logger.logger.bind(this)
    }

    public getIdFromUrl(url: string) {
        if (!url.includes("uptobox.com")) {
            throw new Error("Invalid url")
        }

        return url.split("/").pop()
    }

    public async getUserInfo() {
        const res = await this.client.get("user/me")
        return res.data?.data ?? {}
    }

    public async getDownloadLink(fileId: string, waitingToken: string = ''): Promise<string|undefined> {
        this.logger(`Getting download link for file ${fileId}`)
        const res = await this.client.get(`/link`, {
            params: {
                file_code: fileId,
                waitingToken: waitingToken
            }
        })

        const code = res.data?.statusCode ?? 7
        switch (code) {
            case 0:
                this.logger(`File ${fileId} is ready to download`)
                return res.data?.data?.dlLink ?? ""

            case 16:
            case 39:
                const waitTime = res.data?.data?.waiting ?? 0
                const waitToken = res.data?.data?.waitingToken ?? ''

                this.logger(`File ${fileId} is not ready yet, waiting ${waitTime} seconds`)

                await sleep((waitTime * 1000) + 2000)
                return await this.getDownloadLink(fileId, waitToken)

            default:
                throw new Error("File not found")
        }
    }

    public async getFileInfo(fileId: string) {
        const res = await this.client.get(`/link/info`, {
            params: {
                fileCodes: fileId
            }
        })

        return res.data?.data?.list?.shift() ?? {}
    }
}


export default Uptobox
