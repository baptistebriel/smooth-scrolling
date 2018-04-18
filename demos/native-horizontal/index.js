import Custom from './custom'

const scroll = new Custom({
  preload: false,
  native: true,
  direction: 'vertical',
  section: document.querySelector('.vs-section'),
  divs: document.querySelectorAll('.vs-div')
})

scroll.init()