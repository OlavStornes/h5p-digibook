/**
 * Constructor function.
 */
class SideBar extends H5P.EventDispatcher {
  constructor(chapters, contentId, parent) {
    super();
    this.id = contentId;
    this.parent = parent;
    this.div = this.parseChapters(chapters, this);

  }
  /**
   * Parses the library which is used
   * TODO: Implement a more flexible system for library/title detection
   * @param {string} input 
   */
  parseLibrary(input) {
    let tmp;

    switch (input.library.split(" ")[0]) {

      case "H5P.AdvancedText":
        tmp = input.params.text.match(/<h2>(.+)<\/h2>/);
        if (tmp)
          tmp = tmp[1];
        else
          tmp = "Unnamed paragraph";
        break;

      case "H5P.Image":
        tmp = input.params.alt;
        break;
      default:
        tmp = input.library;
        break;
    }
    return tmp;
  }

  /**
   * Parse an object of chapters to create the navigation bar
   * @param {object} inputContent 
   */
  parseChapters(inputContent, parent) {
    let that = this;
    const divElem = document.createElement('div');
    divElem.classList.add('h5p-digibook-navigation');
    
    for (let i = 0; i < inputContent.length; i++) {
      const chapter = inputContent[i];
      const ulElem = document.createElement('ul');
      const title = document.createElement('p');
      title.innerHTML = chapter.chapter_title;
      
      divElem.appendChild(title);

      for (let j = 0; j < chapter.chapter.params.content.length; j++) {
        const section = chapter.chapter.params.content[j];
        const liElem = document.createElement('li');
        const aElem = document.createElement('button');
        
        aElem.innerHTML = this.parseLibrary(section.content);
        aElem.parent = parent;
        
        aElem.onclick = function () {
          // Send a trigger upstream
          that.parent.trigger('newChapter', {chapter: i, section: j});
        };
        liElem.appendChild(aElem);
        ulElem.appendChild(liElem);
        
      }
      divElem.appendChild(ulElem);
    }
      
    return divElem;
  }
}
export default SideBar;