import { DirectObjectTypeahead } from '../src/components/PhraseBuilder/DirectObjectTypeahead.tsx';
import { describeTypeahead } from './typeaheadSuite.tsx';

describeTypeahead({
  name: 'DirectObjectTypeahead',
  role: 'noun',
  placeholder: 'type a noun…',
  render: (onSelect) => <DirectObjectTypeahead onSelect={onSelect} />,
  renderWithHeader: (header) => <DirectObjectTypeahead onSelect={() => {}} header={header} />,
});
