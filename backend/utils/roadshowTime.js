const TIME_RANGE_PATTERN = /^([01]\d|2[0-3])([:.])([0-5]\d)\s*-\s*([01]\d|2[0-3])([:.])([0-5]\d)$/;

/**
 * Normalize a roadshow time range to HH.MM - HH.MM.
 * Legacy values using ":" remain readable while all API writes use the
 * standard format.
 */
const normalizeRoadshowTime = (value) => {
    if (value === undefined || value === null || value === '') {
        return value;
    }

    if (typeof value !== 'string') {
        throw new Error('Roadshow time must be a string');
    }

    const match = value.trim().match(TIME_RANGE_PATTERN);
    if (!match) {
        throw new Error('Roadshow time must use HH.MM - HH.MM format');
    }

    return `${match[1]}.${match[3]} - ${match[4]}.${match[6]}`;
};

const formatRoadshowTime = (value) => {
    if (typeof value !== 'string' || !value.trim()) {
        return '';
    }

    try {
        return normalizeRoadshowTime(value);
    } catch (error) {
        return value.trim();
    }
};

module.exports = { normalizeRoadshowTime, formatRoadshowTime };
