import Uptobox from "./models/Uptobox";
import Downloader from "./models/Downloader";
import DlProtect from "./models/DlProtect";

const dlProtect = new DlProtect()
const uptobox = new Uptobox(process.env.UPTOBOX_TOKEN as string)
const downloader = new Downloader({})

