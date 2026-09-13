import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { AdjectiveTypeahead } from '../src/components/PhraseBuilder/AdjectiveTypeahead.tsx';
import {
  describeTypeahead,
  listed,
  renderTypeahead,
  typeInto,
  type TypeaheadSpec,
} from './typeaheadSuite.tsx';

const spec: TypeaheadSpec = {
  name: 'AdjectiveTypeahead',
  role: 'adjective',
  placeholder: 'type an adjective…',
  render: (onSelect) => <AdjectiveTypeahead onSelect={onSelect} />,
};

describeTypeahead(spec);

describe('AdjectiveTypeahead header', () => {
  const withHeader: TypeaheadSpec = {
    ...spec,
    render: (onSelect) => (
      <AdjectiveTypeahead onSelect={onSelect} header={<span>category switch</span>} />
    ),
  };

  it('pins the header above the rows', () => {
    renderTypeahead(withHeader);

    const header = screen.getByText('category switch');
    const firstRow = screen.getAllByTestId('typeahead-option')[0]!;
    expect(header.compareDocumentPosition(firstRow)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('keeps the dropdown open for the header when nothing matches', () => {
    const { input } = renderTypeahead(withHeader);

    typeInto(input, 'zzz');

    expect(listed()).toEqual([]);
    expect(screen.getByText('category switch')).toBeInTheDocument();
  });
});
