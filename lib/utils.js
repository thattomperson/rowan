module.exports = {
    counter(timeout) {
        return {
            value: 0,
            inc(v) {
                this.value = this.value + (v ? v : 1)
                setTimeout(() => {
                    this.value = this.value - (v ? v : 1)
                }, timeout).unref()
            },
            val() {
                return this.value
            }
        }
    }
}