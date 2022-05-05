import domReady from '@wordpress/dom-ready';
import $ from 'jquery';

// `domReady` has some yet-unresolved timing issues
// see https://github.com/WordPress/gutenberg/issues/25330
domReady(function () {
  // Need to add a `setTimeout` to defer to the next event loop cycle
  // see https://eager.io/blog/how-to-decide-when-your-code-should-run/
  setTimeout(function () {
    $(
      '.edit-post-header__settings .block-editor-post-preview__dropdown',
    ).hide();
  });
});
