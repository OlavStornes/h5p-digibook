var H5P = H5P || {};
 
H5P.Navbar = (function ($) {
  /**
     * Constructor function.
     */
  class C {
    constructor(options, id) {
      // Extend defaults with provided options
      this.options = $.extend(true, {}, {
        greeting: 'Hello world!',
      }, options);
      // Keep provided id.
      this.id = id;
    }
    /**
       * Attach function called by H5P framework to insert H5P content into
       * page
       *
       * @param {jQuery} $container
       */
    attach($container) {
      // Set class on container to identify it as a greeting card
      // container.  Allows for styling later.
      $container.addClass("h5p-navbar");
      // Add image if provided.
      if (this.options.image && this.options.image.path) {
        $container.append('<img class="greeting-image" src="' + H5P.getPath(this.options.image.path, this.id) + '">');
      }
      // Add greeting text.
      $container.append('<div class="greeting-text">' + this.options.greeting + '</div>');
    }
  }
 
 
  return C;
})(H5P.jQuery);