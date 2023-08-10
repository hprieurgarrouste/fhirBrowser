export class AsyncService {

    static forEachSeries = async (iterable, action) => {
        for (const x of iterable) {
          await action(x)
        }
    }
    static sleep = ms =>
        new Promise(res => {
            setTimeout(res, ms)
        }
    )

}