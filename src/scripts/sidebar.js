/**
 * Constructor function.
 */
class SideBar extends H5P.EventDispatcher {
  constructor(columnSections, contentId, parent) {
    super();
    this.id = contentId;
    this.parent = parent;
    this.div = document.createElement('div');
    this.div.classList.add('h5p-digibook-navigation');

    this.div.appendChild(this.parseColumnContent(columnSections, this));

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
   * Converts a list of chapters and splits it up to its respective sections
   * @param {Column[]} chapters - A list of columns 
   * @returns an array of all the sections
   */
  columnFinder(chapters) {
    let content = { titles: [], sections: [] };
    for (let i = 0; i < chapters.length; i++) {
      content.titles.push(chapters[i].chapter_title);
      //Index will be used in sorting of the sidebar
      for (let j = 0; j < chapters[i].chapter.params.content.length; j++) {
        let input = chapters[i].chapter.params.content[j].content;

        input.chapter = i;
        input.section = j;
        content.sections.push(input);
      }

    }
    return content;
  }

  /**
   * Parse element array from app.js to a more readable format
   * @param {array} inputContent 
   */
  parseColumnContent(inputContent, parent) {
    let ulElem = document.createElement('ul');
    let liElem, aElem;
    var that = this;
    let title = "";

    for (let i = 0; i < inputContent.length; i++) {
      const element = inputContent[i];
      
      title = element.chapter_title;
      for (let j = 0; j < element.chapter.params.content.length; j++) {
        const section = element.chapter.params.content[j];
        
        
        liElem = document.createElement('li');
        aElem = document.createElement('button');
        
        aElem.innerHTML = this.parseLibrary(section.content);
        aElem.parent = parent;
        
        aElem.onclick = function () {
          
          // Send a trigger upstream
          that.parent.trigger('newChapter', {chapter: i, section: j});
          
        };
        liElem.appendChild(aElem);
        ulElem.appendChild(liElem);
        
      }
    }
      
    return ulElem;
  }
}
export default SideBar;