const mongoose = require('mongoose');
require('dotenv').config();

const Organization = require('../models/Organization');
const InternshipRecord = require('../models/InternshipRecord');
const MOU = require('../models/MOU');
const Review = require('../models/Review');
const Roadshow = require('../models/Roadshow');
const { getOrganizationKey } = require('../utils/organizationRecord');

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cwie_organization';

const migrate = async () => {
    await mongoose.connect(mongoUri);
    const organizations = await Organization.find().lean();
    const idMap = new Map();

    for (const organization of organizations) {
        const organizationKey = getOrganizationKey(organization.name_th, organization.name_en);
        const internshipSources = await InternshipRecord.find({
            $and: [
                {
                    $or: [
                        { organization_id: organization._id },
                        { organization_name_th: organization.name_th, organization_name_en: organization.name_en }
                    ]
                },
                {
                    $or: [
                        { school_th: { $exists: true, $nin: ['', null] } },
                        { school_en: { $exists: true, $nin: ['', null] } }
                    ]
                }
            ]
        }).select('school_th school_en').lean();
        const schoolTh = [...new Set(internshipSources.map(record => record.school_th).filter(Boolean))].join(', ');
        const schoolEn = [...new Set(internshipSources.map(record => record.school_en).filter(Boolean))].join(', ');
        const master = await InternshipRecord.findOneAndUpdate(
            { record_type: 'organization', organization_key: organizationKey },
            {
                $set: {
                    record_type: 'organization',
                    organization_key: organizationKey,
                    organization_name_th: organization.name_th,
                    organization_name_en: organization.name_en,
                    address_th: organization.address_th,
                    address_en: organization.address_en,
                    organization_email: organization.email,
                    telephone: organization.phone_number,
                    organization_type: organization.organization_type,
                    industry_category_id: organization.industry_category_id,
                    country_id: organization.country_id,
                    geography_id: organization.geography_id,
                    province_id: organization.province_id,
                    is_public: organization.is_public,
                    logo_path: organization.logo_path,
                    details: organization.details,
                    school_th: schoolTh,
                    school_en: schoolEn,
                    admin_id: organization.admin_id
                }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        idMap.set(String(organization._id), master._id);
    }

    for (const [oldId, newId] of idMap) {
        await InternshipRecord.updateMany({ organization_id: new mongoose.Types.ObjectId(oldId) }, { $set: { organization_id: newId } });
        await MOU.updateMany({ organization_id: new mongoose.Types.ObjectId(oldId) }, { $set: { organization_id: newId } });
        await Review.updateMany({ organization_id: new mongoose.Types.ObjectId(oldId) }, { $set: { organization_id: newId } });
        await Roadshow.updateMany({ organization_id: new mongoose.Types.ObjectId(oldId) }, { $set: { organization_id: newId } });
    }

    const masters = await InternshipRecord.find({ record_type: 'organization' })
        .select('_id organization_name_th organization_name_en school_th school_en')
        .lean();
    const schoolGroups = await InternshipRecord.aggregate([
        {
            $match: {
                record_type: 'internship',
                $or: [
                    { school_th: { $exists: true, $nin: ['', null] } },
                    { school_en: { $exists: true, $nin: ['', null] } }
                ]
            }
        },
        {
            $group: {
                _id: {
                    organization_id: '$organization_id',
                    organization_name_th: '$organization_name_th',
                    organization_name_en: '$organization_name_en'
                },
                schoolsTh: { $addToSet: '$school_th' },
                schoolsEn: { $addToSet: '$school_en' }
            }
        }
    ]);
    const schoolUpdates = [];
    for (const group of schoolGroups) {
        const schoolTh = group.schoolsTh.filter(Boolean).join(', ');
        const schoolEn = group.schoolsEn.filter(Boolean).join(', ');
        const conditions = group._id.organization_id
            ? [{ _id: group._id.organization_id }]
            : [{
                record_type: 'organization',
                organization_name_th: group._id.organization_name_th,
                organization_name_en: group._id.organization_name_en
            }];
        schoolUpdates.push({
            updateOne: {
                filter: { $or: conditions },
                update: { $set: { school_th: schoolTh, school_en: schoolEn } }
            }
        });
    }
    if (schoolUpdates.length) await InternshipRecord.bulkWrite(schoolUpdates, { ordered: false });

    const masterIds = [...idMap.values()];
    const orphanCounts = masterIds.length === 0
        ? { internshipRecords: 0, mous: 0, reviews: 0, roadshows: 0 }
        : {
            internshipRecords: await InternshipRecord.countDocuments({
                organization_id: { $ne: null, $nin: masterIds }
            }),
            mous: await MOU.countDocuments({ organization_id: { $nin: masterIds } }),
            reviews: await Review.countDocuments({ organization_id: { $nin: masterIds } }),
            roadshows: await Roadshow.countDocuments({ organization_id: { $nin: masterIds } })
        };

    console.log(JSON.stringify({
        migratedOrganizations: idMap.size,
        preservedOrganizationsCollection: organizations.length,
        organizationMastersChecked: masters.length,
        organizationMastersWithSchoolBackfilled: schoolUpdates.length,
        orphanCounts
    }, null, 2));
};

migrate()
    .catch(error => {
        console.error('Organization migration failed:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
