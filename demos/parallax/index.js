import Custom from './custom'

const scroll = new Custom({
    extends: true,
    preload: false,
    section: document.querySelector('.vs-section'),
    divs: document.querySelectorAll('.vs-div')
})

scroll.init()