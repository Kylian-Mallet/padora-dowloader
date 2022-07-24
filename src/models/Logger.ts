abstract class Logger {
    public static logger(...args) {
        console.log(`(${this.constructor.name})`, ...args)
    }
}

export default Logger
