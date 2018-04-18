import Custom from './custom'

const scroll = new Custom({
  preload: true,
  native: true,
  section: document.querySelector('.vs-section'),
  divs: document.querySelectorAll('.vs-div')
})

scroll.init()