import Custom from './custom'

const scroll = new Custom({
    extends: true,
    preload: true,
    section: document.querySelector('.vs-section'),
    divs: document.querySelectorAll('.vs-div')
})

scroll.init()