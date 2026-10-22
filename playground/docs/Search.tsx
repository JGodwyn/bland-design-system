// Search the design system (⌘K or Ctrl+K): pages by title, then anything else that mentions the words.
// Built from Bland: a Modal holding a Search Input, 1 line List rows grouped like the sidebar, and an
// Empty State when nothing matches.
//
// A combobox, as command palettes are: focus stays in the field, one result is highlighted (the first,
// Colors, on opening and after every keystroke), arrow keys move the highlight and Enter opens it.
import { useEffect, useId, useMemo, useState, type KeyboardEvent } from 'react';
import { EmptyState } from '../../src/components/empty-state/EmptyState';
import { Icon } from '../../src/components/icon/Icon';
import { ListItem } from '../../src/components/list/ListItem';
import { Modal } from '../../src/components/modal/Modal';
import { ScrollArea } from '../../src/components/scroll-area/ScrollArea';
import { SearchInput } from '../../src/components/search-input/SearchInput';
import { ListMagnifyingGlassIcon } from './icons';
import { PageIcon, search, type SearchHit } from './pages';

/** ⌘ on Apple keyboards, Ctrl elsewhere: what the shortcut hint shows. */
export const isApple = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

export function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const results = useMemo(() => search(query), [query]);
  const groups = [
    { title: 'Foundations', hits: results.foundations },
    { title: 'Components', hits: results.components },
    { title: 'Other results', hits: results.other },
  ];
  const hits = groups.flatMap((g) => g.hits);
  const base = useId();
  const optionId = (i: number) => `${base}-option-${i}`;

  // Every opening starts from an empty field, on the first result.
  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
    }
  }, [open]);
  // The highlighted row stays in view as the arrows move it.
  useEffect(() => {
    document.getElementById(optionId(active))?.scrollIntoView({ block: 'nearest' });
  }, [active, query]);

  const go = (hit: SearchHit | undefined) => {
    if (!hit) return;
    location.hash = hit.href;
    onOpenChange(false); // also for the page already open: same hash, no route change
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (hits.length === 0) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (a + (e.key === 'ArrowDown' ? 1 : -1) + hits.length) % hits.length);
    } else if (e.key === 'Home' && e.ctrlKey) {
      setActive(0);
    } else if (e.key === 'End' && e.ctrlKey) {
      setActive(hits.length - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(hits[active]);
    }
  };

  let index = 0;
  return (
    <Modal size="md" open={open} onOpenChange={onOpenChange} aria-label="Search Bland" closeButton={false} className="docs-search">
      <div className="docs-search-body">
        <SearchInput
          size="md"
          autoFocus
          role="combobox"
          aria-label="Search Bland"
          aria-expanded={hits.length > 0}
          aria-controls={`${base}-results`}
          aria-autocomplete="list"
          aria-activedescendant={hits.length > 0 ? optionId(active) : undefined}
          placeholder="Search Bland here"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          clearable
          onClear={() => {
            setQuery('');
            setActive(0);
          }}
        />
        <ScrollArea className="docs-search-results" fadeSize="sm">
          {hits.length === 0 ? (
            <EmptyState
              titleAs="p"
              illustration={
                <Icon size="lg" className="docs-search-empty-icon">
                  <ListMagnifyingGlassIcon />
                </Icon>
              }
              title="Nothing found"
              description={
                <>
                  Can’t find any “<strong>{query}</strong>” in Bland
                </>
              }
            />
          ) : (
            <div role="listbox" id={`${base}-results`} aria-label="Results">
              {groups.map((group) => {
                if (group.hits.length === 0) return null;
                const headingId = `${base}-${group.title}`;
                return (
                  <div key={group.title} role="group" aria-labelledby={headingId} className="docs-search-group">
                    <p id={headingId} className="docs-group-heading" role="presentation">
                      {group.title}
                    </p>
                    <ul className="docs-search-list" role="presentation">
                      {group.hits.map((hit) => {
                        const i = index++;
                        return (
                          <ListItem
                            key={`${hit.href} ${hit.title} ${hit.detail ?? ''}`}
                            role="presentation"
                            data-active={i === active || undefined}
                            href={hit.href}
                            title={hit.title}
                            description={hit.detail}
                            leading={hit.page?.icon ? <PageIcon page={hit.page} /> : undefined}
                            renderLink={(props) => (
                              <a
                                {...props}
                                id={optionId(i)}
                                role="option"
                                aria-selected={i === active}
                                tabIndex={-1}
                                onMouseMove={() => setActive(i)}
                                onClick={(e) => {
                                  e.preventDefault();
                                  go(hit);
                                }}
                              />
                            )}
                          />
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>
    </Modal>
  );
}
