import { AdverbTypeahead } from '../src/components/PhraseBuilder/AdverbTypeahead.tsx';
import { describeTypeahead } from './typeaheadSuite.tsx';

describeTypeahead({
  name: 'AdverbTypeahead',
  role: 'adverb',
  placeholder: 'type an adverb…',
  render: (onSelect) => <AdverbTypeahead onSelect={onSelect} />,
});
