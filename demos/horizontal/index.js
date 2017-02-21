import Custom from './custom'

const scroll = new Custom({
    preload: false,
    native: false,
    direction: 'horizontal',
    section: document.querySelector('.vs-section'),
    divs: document.querySelectorAll('.vs-div')
})

scroll.init()