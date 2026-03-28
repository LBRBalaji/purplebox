const fs = require('fs');
let c = fs.readFileSync('src/ai/flows/predict-demand-trends.ts', 'utf8');

const oldSection = `    const {output} = await prompt({
      ...input,
      listings: filteredListings,
      demands: input.demands || [],
      submissions: input.submissions || [],
      analytics: input.analytics || [],
    });`;

const newSection = `    // Trim data to avoid Gemini token limits
    const trimmedListings = filteredListings.slice(0, 25).map((l: any) => ({
      listingId: l.listingId, location: l.location, sizeSqFt: l.sizeSqFt,
      availabilityDate: l.availabilityDate, warehouseModel: l.warehouseModel,
      buildingType: l.buildingSpecifications?.buildingType,
      eveHeight: l.buildingSpecifications?.eveHeightMeters,
      docks: l.buildingSpecifications?.numberOfDocksAndShutters,
      roofType: l.buildingSpecifications?.roofType,
      craneAvailable: l.buildingSpecifications?.craneAvailable,
      fireNOC: l.certificatesAndApprovals?.fireNOC,
      rentPerSqFt: l.rentPerSqFt, status: l.status,
    }));
    const trimmedDemands = (input.demands || []).slice(0, 15).map((d: any) => ({
      location: d.location, size: d.size, sizeMin: d.sizeMin, sizeMax: d.sizeMax,
      readiness: d.readiness, buildingType: d.buildingType,
      operationType: d.operationType, createdAt: d.createdAt,
    }));
    const trimmedAnalytics = (input.analytics || []).slice(0, 25).map((a: any) => ({
      listingId: a.listingId, views: a.views, downloads: a.downloads,
    }));

    const {output} = await prompt({
      ...input,
      listings: trimmedListings,
      demands: trimmedDemands,
      submissions: (input.submissions || []).slice(0, 10),
      analytics: trimmedAnalytics,
    });`;

c = c.replace(oldSection, newSection);
fs.writeFileSync('src/ai/flows/predict-demand-trends.ts', c);
console.log('Done');
