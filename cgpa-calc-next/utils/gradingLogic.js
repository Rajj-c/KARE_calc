export const getGradePoint = (grade, regulation = '2021') => {
    // Common Grades
    if (grade === 'S') return 10;
    if (grade === 'U' || grade === 'W' || grade === 'AB') return 0;

    if (regulation === '2021') {
        // Regulation 2021 (Standard)
        // S=10, A=9, B=8, C=7, D=6, E=5, U=0
        const map = { 'S': 10, 'A': 9, 'B': 8, 'C': 7, 'D': 6, 'E': 5, 'U': 0 };
        return map[grade] || 0;
    } else {
        // Regulation 2025 (Proposed/New)
        // S=10, A=8, B=7, C=6, D=5, E=4, U=0
        // NOTE: A starts at 8. E is 4.
        const map = { 'S': 10, 'A': 8, 'B': 7, 'C': 6, 'D': 5, 'E': 4, 'U': 0 };
        return map[grade] || 0;
    }
};

export const getGradeOptions = (regulation) => {
    // Both 2021 and 2025 use S, A, B, C, D, E, U
    // Regulation 2018 had 'P', but these do not.
    return ['S', 'A', 'B', 'C', 'D', 'E', 'U', 'AB'];
};

export const getRegulationDetails = (regulation) => {
    if (regulation === '2025') {
        return [
            { g: 'S', p: 10, r: 'Pass' },
            { g: 'A', p: 8, r: 'Pass' },
            { g: 'B', p: 7, r: 'Pass' },
            { g: 'C', p: 6, r: 'Pass' },
            { g: 'D', p: 5, r: 'Pass' },
            { g: 'E', p: 4, r: 'Pass' },
            { g: 'U', p: 0, r: 'Fail' },
        ];
    }
    // Default 2021
    return [
        { g: 'S', p: 10, r: 'Pass' },
        { g: 'A', p: 9, r: 'Pass' },
        { g: 'B', p: 8, r: 'Pass' },
        { g: 'C', p: 7, r: 'Pass' },
        { g: 'D', p: 6, r: 'Pass' },
        { g: 'E', p: 5, r: 'Pass' },
        { g: 'U', p: 0, r: 'Fail' },
    ];
};
