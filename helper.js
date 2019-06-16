function delayCall(func, delayTime = 2000) {
    setTimeout(() => {
        func()
    }, delayTime);
}
module.exports = delayCall