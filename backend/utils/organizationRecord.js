const normalizeOrganizationName = value =>
    String(value || '').replace(/\s+/g, ' ').trim().toLowerCase();

const getOrganizationKey = (nameTh, nameEn) =>
    `${normalizeOrganizationName(nameTh)}\u0000${normalizeOrganizationName(nameEn)}`;

const toOrganizationResponse = record => {
    if (!record) return null;

    const obj = typeof record.toObject === 'function'
        ? record.toObject()
        : { ...record };

    return {
        ...obj,
        name_th: obj.organization_name_th || obj.name_th || '',
        name_en: obj.organization_name_en || obj.name_en || '',
        address_th: obj.address_th || '',
        address_en: obj.address_en || '',
        email: obj.organization_email || obj.email || '',
        phone_number: obj.telephone || obj.phone_number || '',
        province_id: obj.province_id || obj.province_en || obj.province_th || '',
        country_id: obj.country_id || obj.country_en || obj.country_th || '',
        organization_type: obj.organization_type || obj.business_type_en || obj.business_type_th || '',
        details: obj.details || ''
    };
};

const toOrganizationRecord = (body, adminId, current = {}) => ({
    record_type: 'organization',
    organization_key: getOrganizationKey(
        body.name_th || current.organization_name_th,
        body.name_en || current.organization_name_en
    ),
    organization_name_th: body.name_th ?? current.organization_name_th ?? '',
    organization_name_en: body.name_en ?? current.organization_name_en ?? '',
    address_th: body.address_th ?? current.address_th ?? '',
    address_en: body.address_en ?? current.address_en ?? '',
    organization_email: body.email ?? current.organization_email ?? '',
    telephone: body.phone_number ?? current.telephone ?? '',
    province_id: body.province_id ?? current.province_id ?? '',
    province_th: body.province_th ?? current.province_th ?? '',
    province_en: body.province_en ?? current.province_en ?? '',
    country_id: body.country_id ?? current.country_id ?? '',
    country_th: body.country_th ?? current.country_th ?? '',
    country_en: body.country_en ?? current.country_en ?? '',
    geography_id: body.geography_id ?? current.geography_id ?? '',
    organization_type: body.organization_type ?? current.organization_type,
    business_type_th: body.business_type_th ?? current.business_type_th ?? '',
    business_type_en: body.business_type_en ?? current.business_type_en ?? '',
    business_category_th: body.business_category_th ?? current.business_category_th ?? '',
    business_category_en: body.business_category_en ?? current.business_category_en ?? '',
    multinational_corporation: body.multinational_corporation ?? current.multinational_corporation ?? '',
    industry_category_id: body.industry_category_id ?? current.industry_category_id ?? '',
    is_public: body.is_public ?? current.is_public ?? true,
    logo_path: body.logo_path ?? current.logo_path,
    details: body.details ?? current.details ?? '',
    admin_id: adminId || current.admin_id
});

module.exports = {
    getOrganizationKey,
    normalizeOrganizationName,
    toOrganizationRecord,
    toOrganizationResponse
};
