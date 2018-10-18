/**
 * The introduction module
 * Constructor function.
 */
class Cover extends H5P.EventDispatcher {
  constructor(coverParam, titleText, readText, contentId, contentData, parent) {
    super();

    this.parent = parent;

    this.div = this.createParentElement();

    this.visuals = this.createVisualsElement(coverParam.coverImage, contentId);
    this.title = this.parseTitle(titleText);
    this.description = this.parseDescription(coverParam.coverDescription);
    this.author = 'temp';

    this.button = this.createReadButton(readText);

    this.div.appendChild(this.visuals);
    this.div.appendChild(this.title);
    this.div.appendChild(this.description);
    this.div.appendChild(this.button);
  } 

  createVisualsElement(coverImage, contentId) {

    const div = document.createElement('div');
    div.classList.add('h5p-digibook-cover-graphics');
    const visuals = this.parseImage(coverImage, contentId);
    const backBorder = this.createBackBorder();

    div.appendChild(visuals);
    div.appendChild(backBorder);

    return div;
  }

  createBackBorder() {
    const div = document.createElement('div');
    div.classList.add('h5p-digibook-cover-bar');

    return div;

  }

  createParentElement() {
    const div = document.createElement('div');
    div.classList.add('h5p-digibook-cover');
    return div;
  }

  createReadButton(input) {
    const buttonElem = document.createElement('div');
    buttonElem.classList.add('h5p-digibook-cover-readbutton');
    const button = document.createElement('button');
    button.innerHTML = input;

    button.onclick = () => {
      this.removeCover();
    };


    buttonElem.appendChild(button);
    return buttonElem;
  }

  parseImage(options, id) {
    const img = document.createElement('img');
    img.classList.add('h5p-digibook-cover-image');
    img.src = H5P.getPath(options.path, id);
    img.setAttribute('draggable', 'false');
    img.setAttribute('tabindex', 0);

    return img;
  }

  removeCover() {
    this.div.remove();
  }

  parseTitle(input) {
    const titleElem = document.createElement('div');
    titleElem.classList.add('h5p-digibook-cover-title');
    const title = document.createElement('p');
    title.innerHTML = input;

    titleElem.appendChild(title);

    return titleElem;
  }

  parseDescription(input) {
    const descElem = document.createElement('div');
    descElem.classList.add('h5p-digibook-cover-description');
    const desc = document.createElement('p');
    desc.innerHTML = input;

    descElem.appendChild(desc);

    return descElem;
  }
}

export default Cover;