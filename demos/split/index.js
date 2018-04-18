import Custom from './custom'

const scroll = new Custom({
  extends: true,
  native: true,
  section: document.querySelector('.vs-sections'),
  sections: document.querySelectorAll('.vs-split')
})

scroll.init()