/** Bounded data operations shared by inline validation and the linked view. */
import type { IntelligentUiExplorerItem } from './types.ts';
/** Reject ambiguous record identities and summaries that would change units or fill missing cells. */
export declare function bindExplorer(item: IntelligentUiExplorerItem): IntelligentUiExplorerItem;
/** Required filters start at the first source record; optional filters start at All. */
export declare function explorerDefaults(item: IntelligentUiExplorerItem): readonly (string | null)[];
/** Every visible value and the inspector are derived from the same filtered source rows. */
export declare function explore(item: IntelligentUiExplorerItem, filters: readonly (string | null)[], selectedKey: string, fallbackIndex?: number): {
    rows: (readonly string[])[];
    selected: readonly string[] | undefined;
    metrics: {
        label: string;
        value: number | null;
        unit: string;
        count: number | undefined;
    }[];
};
//# sourceMappingURL=explorer.d.ts.map