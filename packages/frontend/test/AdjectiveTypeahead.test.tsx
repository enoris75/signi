import { AdjectiveTypeahead } from '../src/components/PhraseBuilder/AdjectiveTypeahead.tsx';
import { describeTypeahead } from './typeaheadSuite.tsx';

describeTypeahead({
  name: 'AdjectiveTypeahead',
  role: 'adjective',
  placeholder: 'type an adjective…',
  render: (onSelect) => <AdjectiveTypeahead onSelect={onSelect} />,
  renderWithHeader: (header) => <AdjectiveTypeahead onSelect={() => {}} header={header} />,
});
