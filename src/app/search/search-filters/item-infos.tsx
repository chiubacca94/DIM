import { tl } from 'app/i18next-t';
import { getNotes, getTag, itemTagSelectorList } from 'app/inventory/dim-item-info';
import { FilterDefinition } from '../filter-types';

// check item tags or presence of notes
const itemInfosFilters: FilterDefinition[] = [
  {
    keywords: 'tagged',
    description: tl('Filter.Tags.Tagged'),
    filterFunction: ({ itemInfos, itemHashTags }) => (item) =>
      getTag(item, itemInfos, itemHashTags) !== undefined,
  },
  {
    keywords: 'tag',
    description: tl('Filter.Tags.Tag'),
    format: 'query',
    suggestionsGenerator: itemTagSelectorList.map((tag) => tag.type ?? 'none'),
    filterFunction: ({ filterValue, itemInfos, itemHashTags }) => (item) =>
      (getTag(item, itemInfos, itemHashTags) || 'none') === filterValue,
  },
  {
    keywords: 'hasnotes',
    description: tl('Filter.HasNotes'),
    filterFunction: ({ itemInfos, itemHashTags }) => (item) =>
      Boolean(getNotes(item, itemInfos, itemHashTags)),
  },
];

export default itemInfosFilters;
