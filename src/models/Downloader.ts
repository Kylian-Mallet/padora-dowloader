import axios, {AxiosInstance} from "axios";
import * as Fs from "fs";
import * as Path from "path";
import Logger from "./Logger";
import {checkWgetExist} from "../utils";
import {exec} from "child_process";


class Downloader {
    private config: Object;
    private client: AxiosInstance;

    constructor(config: Object) {
        this.config = config
        this.client = axios.create()
    }

    public createDownload(url: string, fileName: string = null) {
        return new Download(url, fileName)
    }

    public downloadFromUrl(url: string, fileName: string = null) {
        return new Download(url, fileName).start()
    }
}


class Download {
    public url: string;
    public filename: string;
    public state: string = 'idle';

    private readonly logger: Function;

    constructor(url: string, fileName: string = null) {
        this.url = url
        this.filename = fileName ?? this.url.split('/').pop()

        this.logger = Logger.logger.bind(this)
    }

    public async start() {
        this.state = 'downloading'
        this.logger(`${this.filename} - Downloading`)

        if (checkWgetExist()) {
            await this.downloadWget()
        } else {
            this.logger(`wget not found, downloading with axios ...`)
            await this.downloadClient()
        }

        this.logger(`${this.filename} - Download Complete`)
        return this
    }

    private async downloadWget() {
        const path = Path.resolve(__dirname, '../../downloads/', this.filename)
        const cmd = `wget -O ${path} ${this.url}`
        exec(cmd, (err, stdout) => {
            if (err) {
                this.logger(err)
            }

            this.logger(stdout)
        })
    }

    private async downloadClient() {
        const path = Path.resolve(__dirname, '../../downloads/', this.filename)
        const writer = Fs.createWriteStream(path)
        const res = await axios.get(this.url, {
            responseType: 'stream'
        })

        res.data.pipe(writer)
        writer.on('finish', () => {
            this.state = 'finished'
        })
    }
}


export default Downloader
