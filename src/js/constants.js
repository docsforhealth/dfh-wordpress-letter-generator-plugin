// *************
// * WordPress *
// *************

export const INNER_BLOCKS_LOCKED = 'all';
export const INNER_BLOCKS_UNLOCKED = false;

export const STORE_BLOCK_EDITOR = 'core/block-editor';
export const STORE_CORE_DATA = 'core';
export const STORE_EDITOR_UI = 'core/edit-post';
export const STORE_POST_EDITOR = 'core/editor';

// see https://github.com/WordPress/gutenberg/tree/trunk/packages/core-data/src/entity-types
export const ENTITY_KIND_POST_TYPE = 'postType';

export const API_CONTEXT_VIEW = 'view';

export const POST_STATUS_PUBLISHED = 'publish';

// **********
// * Plugin *
// **********

export const NAMESPACE = 'dlg';
export const TEXT_DOMAIN = 'dlg';

export const ATTR_HIDE_API_PREFIX = '_noApi_';

export const CONTENT_TYPE_SHARED_DATA_ELEMENT = 'dlg_data_element';

export const FORMAT_DATA_ELEMENT = `${NAMESPACE}/format-data-element`;
export const AUTOCOMPLETE_DATA_ELEMENT = `${NAMESPACE}/data-element`;

export const CATEGORY_LETTER_TEMPLATE = 'dlg-letter-template';

// **********
// * Blocks *
// **********

export const DFH_BLOCK_TEXT = 'dfh/text';

export const BLOCK_DATA_ELEMENT_IMAGE = `${NAMESPACE}/data-image`;
export const BLOCK_DATA_ELEMENT_OPTIONS = `${NAMESPACE}/data-options`;
export const BLOCK_DATA_ELEMENT_OPTIONS_CHOICES = `${NAMESPACE}/data-options-choices`;
export const BLOCK_DATA_ELEMENT_OPTIONS_OPTION = `${NAMESPACE}/data-options-option`;
export const BLOCK_DATA_ELEMENT_TEXT = `${NAMESPACE}/data-text`;
export const BLOCK_DATA_ELEMENTS = `${NAMESPACE}/data-elements`;
export const BLOCK_DATA_ELEMENTS_SECTION = `${NAMESPACE}/data-elements-section`;
export const BLOCK_LETTER_CONTENT = `${NAMESPACE}/letter-content`;
export const BLOCK_LETTER_TEMPLATE = `${NAMESPACE}/letter-template`;
export const BLOCK_SHARED_DATA_ELEMENT = `${NAMESPACE}/shared-data-element`;
