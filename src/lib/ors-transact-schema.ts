// ORS Transact — Field Schema
// Auto-generated from ORS 2019 Master CSV
// Row 0: Public/Internal | Row 1: Field labels

export type FieldVisibility = 'public' | 'internal';
export type FieldGroup =
  | 'identity' | 'advertisement' | 'location' | 'size' | 'facility_type'
  | 'commercial' | 'distances' | 'telecalling' | 'building' | 'site_inspection'
  | 'shopfloor' | 'utilities' | 'amenities' | 'compliance' | 'other';

export type OrsTransactRole =
  | 'Field Staff' | 'TP' | 'OP' | 'BSS' | 'Customer Relations Executive'
  | 'Admin' | 'SuperAdmin';

export type CrudPermission = 'create' | 'read' | 'update' | 'delete';

export interface FieldDef {
  idx: number;
  key: string;
  label: string;
  visibility: FieldVisibility;
  group: FieldGroup;
  level: 1 | 2 | 3; // 1=card, 2=detail, 3=internal
}

export interface OrsTransactRoleConfig {
  role: OrsTransactRole;
  groups: FieldGroup[] | ['*'];
  crud: CrudPermission[];
  email?: string;
}

export const GROUP_LABELS: Record<FieldGroup, string> = {
  identity: 'Property Identity',
  advertisement: 'Advertisement & Source',
  location: 'Location',
  size: 'Size & Extent',
  facility_type: 'Facility Type',
  commercial: 'Commercial Terms',
  distances: 'Distance Matrix',
  telecalling: 'Tele-Calling',
  building: 'Building Details',
  site_inspection: 'Site Inspection',
  shopfloor: 'Shop Floor Specifications',
  utilities: 'Utilities & Power',
  amenities: 'Amenities & Facilities',
  compliance: 'Compliance & Approvals',
  other: 'Other',
};

export const DEFAULT_ROLE_GROUPS: Record<OrsTransactRole, FieldGroup[] | ['*']> = {
  'Field Staff': ['identity', 'location', 'facility_type', 'building', 'shopfloor', 'site_inspection'],
  'TP': ['identity', 'location', 'facility_type', 'building', 'commercial', 'distances'],
  'OP': ['identity', 'location', 'facility_type', 'building', 'shopfloor', 'utilities', 'amenities', 'compliance', 'distances'],
  'BSS': ['identity', 'location', 'advertisement', 'telecalling'],
  'Customer Relations Executive': ['identity', 'location', 'facility_type', 'telecalling'],
  'Admin': ['*'],
  'SuperAdmin': ['*'],
};

export const DEFAULT_ROLE_CRUD: Record<OrsTransactRole, CrudPermission[]> = {
  'Field Staff': ['read', 'update'],
  'TP': ['read', 'update'],
  'OP': ['read', 'update'],
  'BSS': ['read', 'update'],
  'Customer Relations Executive': ['read'],
  'Admin': ['create', 'read', 'update', 'delete'],
  'SuperAdmin': ['create', 'read', 'update', 'delete'],
};

// LEVEL 1 — Card (vital, public)
export const LEVEL1_KEYS = [
  'ors_property_id', 'state', 'district', 'city_location', 'locality_circle',
  'facility_type', 'lease_area_as_advertised_in_sq_ft', 'lease_area_range_in_sq_ft',
  'center_ceiling_height_in_feet', 'building_availability',
  'distance_from_oragadam_in_km', 'distance_from_sriperumbudur_in_km',
  'distance_from_chennai_airport_in_km',
];

// LEVEL 2 — Detail (max 25, public, login required)
export const LEVEL2_KEYS = [
  'shop_floor_dimension', 'shop_floor_side_eve_height_in_feet',
  'floor_load_bearing_capacity_in_metric_ton_per_sq_mt',
  'electricty_power_available_and_type', 'electricty_power_availability_in_kva',
  'back_up_power_availability', 'crane', 'crane_type_and_capacity',
  'shutters_type', 'number_of_loading_ramps_and_type_of_ramps',
  'ramp_for_forklift', 'is_loading_area_covered_with_canopy',
  'exhaust_fan', 'windows', 'shop_floor_flooring',
  'pillars_columns', 'span_between_pillars_in_feet',
  'etp_effluent_treatment_plant_availability', 'rain_water_harvesting_system',
  'truck_parking_facility_for_40_feet_containers',
  'feasibility_of_truck_movement_around_facility',
  'land_zone_classification', 'is_building_approved',
  'scalability', 'total_built_up_area_in_sq_ft',
];

export const ORS_TRANSACT_FIELDS: FieldDef[] = [
{"idx":0,"key":"ors_property_id","label":"ORS PROPERTY ID","visibility":"public","group":"identity","level":1},
{"idx":1,"key":"lbr_property_secondary_id","label":"LBR PROPERTY SECONDARY ID","visibility":"internal","group":"identity","level":3},
{"idx":2,"key":"source_of_inventory","label":"SOURCE OF INVENTORY","visibility":"internal","group":"advertisement","level":3},
{"idx":3,"key":"ors_ad_id","label":"ORS AD ID","visibility":"internal","group":"advertisement","level":3},
{"idx":4,"key":"ors_advt_date","label":"ORS ADVT DATE","visibility":"internal","group":"advertisement","level":3},
{"idx":5,"key":"advertisement_content_as_advertised","label":"ADVERTISEMENT CONTENT - AS ADVERTISED","visibility":"internal","group":"advertisement","level":3},
{"idx":6,"key":"contact_number_as_advertised_1","label":"CONTACT NUMBER - AS ADVERTISED 1","visibility":"internal","group":"advertisement","level":3},
{"idx":7,"key":"contact_number_as_advertised_2","label":"CONTACT NUMBER - AS ADVERTISED 2","visibility":"internal","group":"advertisement","level":3},
{"idx":8,"key":"contact_number_as_advertised_3","label":"CONTACT NUMBER - AS ADVERTISED 3","visibility":"internal","group":"advertisement","level":3},
{"idx":9,"key":"location_as_advertised","label":"LOCATION - AS ADVERTISED","visibility":"internal","group":"advertisement","level":3},
{"idx":10,"key":"country","label":"COUNTRY","visibility":"internal","group":"advertisement","level":3},
{"idx":11,"key":"state","label":"STATE","visibility":"public","group":"location","level":1},
{"idx":12,"key":"district","label":"DISTRICT","visibility":"public","group":"location","level":1},
{"idx":13,"key":"sub_district","label":"SUB-DISTRICT","visibility":"public","group":"location","level":2},
{"idx":14,"key":"city_location","label":"CITY LOCATION","visibility":"public","group":"location","level":1},
{"idx":15,"key":"locality_circle","label":"LOCALITY CIRCLE","visibility":"public","group":"location","level":1},
{"idx":16,"key":"land_extent_as_advertised","label":"LAND EXTENT - AS ADVERTISED","visibility":"internal","group":"size","level":3},
{"idx":17,"key":"lease_area_as_advertised_in_sq_ft","label":"LEASE AREA - AS ADVERTISED - IN SQ.FT","visibility":"public","group":"size","level":1},
{"idx":18,"key":"lease_area_range_in_sq_ft","label":"LEASE AREA RANGE - IN SQ.FT","visibility":"public","group":"size","level":1},
{"idx":19,"key":"total_land_extent","label":"TOTAL LAND EXTENT","visibility":"internal","group":"size","level":3},
{"idx":20,"key":"facility_type","label":"FACILITY TYPE","visibility":"public","group":"facility_type","level":1},
{"idx":21,"key":"monthly_rent_per_sq_ft","label":"MONTHLY RENT PER SQ.FT","visibility":"internal","group":"commercial","level":3},
{"idx":22,"key":"is_advertisement_repeated","label":"IS ADVERTISEMENT REPEATED","visibility":"internal","group":"advertisement","level":3},
{"idx":23,"key":"repeat_advertisement_other_ibr_ids","label":"REPEAT ADVERTISEMENT - OTHER IBR IDs","visibility":"internal","group":"advertisement","level":3},
{"idx":24,"key":"advt_note_book_number","label":"ADVT NOTE BOOK NUMBER","visibility":"internal","group":"advertisement","level":3},
{"idx":25,"key":"advt_note_book_page_number","label":"ADVT NOTE BOOK - PAGE NUMBER","visibility":"internal","group":"advertisement","level":3},
{"idx":26,"key":"on_line_information_about_advertiser","label":"ON-LINE INFORMATION ABOUT ADVERTISER","visibility":"internal","group":"advertisement","level":3},
{"idx":27,"key":"advertised_by","label":"ADVERTISED BY","visibility":"internal","group":"advertisement","level":3},
{"idx":28,"key":"site_sketches_hard_copy_stored_location","label":"SITE SKETCHES HARD COPY - STORED LOCATION","visibility":"internal","group":"advertisement","level":3},
{"idx":29,"key":"site_sketches_soft_copy_stored_location","label":"SITE SKETCHES SOFT COPY - STORED LOCATION","visibility":"internal","group":"advertisement","level":3},
{"idx":30,"key":"site_pictures_stored_location","label":"SITE PICTURES - STORED LOCATION","visibility":"internal","group":"advertisement","level":3},
{"idx":31,"key":"write_up_document_proposal_stored_location","label":"WRITE UP DOCUMENT / PROPOSAL - STORED LOCATION","visibility":"internal","group":"advertisement","level":3},
{"idx":32,"key":"distance_from_chennai_port_in_km","label":"DISTANCE FROM CHENNAI PORT - IN KM","visibility":"public","group":"distances","level":2},
{"idx":33,"key":"distance_from_ennore_port_in_km","label":"DISTANCE FROM ENNORE PORT - IN KM","visibility":"public","group":"distances","level":2},
{"idx":34,"key":"distance_from_krishnapattinam_port_in_km","label":"DISTANCE FROM KRISHNAPATTINAM PORT - IN KM","visibility":"public","group":"distances","level":2},
{"idx":35,"key":"distance_from_karaikal_port_in_km","label":"DISTANCE FROM KARAIKAL PORT - IN KM","visibility":"public","group":"distances","level":2},
{"idx":36,"key":"distance_from_chennai_airport_in_km","label":"DISTANCE FROM CHENNAI AIRPORT - IN KM","visibility":"public","group":"distances","level":1},
{"idx":37,"key":"distance_from_oragadam_in_km","label":"DISTANCE FROM ORAGADAM - IN KM","visibility":"public","group":"distances","level":1},
{"idx":38,"key":"distance_from_sriperumbudur_in_km","label":"DISTANCE FROM SRIPERUMBUDUR - IN KM","visibility":"public","group":"distances","level":1},
{"idx":39,"key":"distance_from_ford_maraimalai_nagar_in_km","label":"DISTANCE FROM FORD-MARAIMALAI NAGAR - IN KM","visibility":"public","group":"distances","level":2},
{"idx":40,"key":"distance_from_mahindra_world_city_in_km","label":"DISTANCE FROM MAHINDRA WORLD CITY - IN KM","visibility":"public","group":"distances","level":2},
{"idx":41,"key":"kathipara_junction_inner_ring_road_entry_point_in_km","label":"KATHIPARA JUNCTION - INNER RING ROAD - IN KM","visibility":"public","group":"distances","level":2},
{"idx":42,"key":"koyambedu_inner_ring_road_point_2_in_km","label":"KOYAMBEDU - INNER RING ROAD - IN KM","visibility":"public","group":"distances","level":2},
{"idx":43,"key":"padi_junction_inner_ring_road_point_3_in_km","label":"PADI JUNCTION - INNER RING ROAD - IN KM","visibility":"public","group":"distances","level":2},
{"idx":44,"key":"madhavaram_inner_ring_road_point_4_in_km","label":"MADHAVARAM - INNER RING ROAD - IN KM","visibility":"public","group":"distances","level":2},
{"idx":45,"key":"manali_inner_ring_road_exit_point_in_km","label":"MANALI - INNER RING ROAD EXIT - IN KM","visibility":"public","group":"distances","level":2},
{"idx":46,"key":"tambaram_by_pass_road_entry_point_in_km","label":"TAMBARAM - BY PASS ROAD - IN KM","visibility":"public","group":"distances","level":2},
{"idx":47,"key":"maduravoyal_by_pass_road_point_2_in_km","label":"MADURAVOYAL - BY PASS ROAD - IN KM","visibility":"public","group":"distances","level":2},
{"idx":48,"key":"ambattur_industrial_estate_by_pass_road_point_3_in_km","label":"AMBATTUR INDUSTRIAL ESTATE - BY PASS ROAD - IN KM","visibility":"public","group":"distances","level":2},
{"idx":49,"key":"puzhal_by_pass_road_exit_point_in_km","label":"PUZHAL - BY PASS ROAD EXIT - IN KM","visibility":"public","group":"distances","level":2},
{"idx":50,"key":"vandalur_outer_ring_road_entry_point_in_km","label":"VANDALUR - OUTER RING ROAD - IN KM","visibility":"public","group":"distances","level":2},
{"idx":51,"key":"poonamallee_outer_ring_road_point_2_in_km","label":"POONAMALLEE - OUTER RING ROAD - IN KM","visibility":"public","group":"distances","level":2},
{"idx":52,"key":"nemili_outer_ring_road_point_3_in_km","label":"NEMILI - OUTER RING ROAD POINT 3 - IN KM","visibility":"public","group":"distances","level":2},
{"idx":53,"key":"nemili_outer_ring_road_point_4_in_km","label":"NEMILI - OUTER RING ROAD POINT 4 - IN KM","visibility":"public","group":"distances","level":2},
{"idx":54,"key":"minjur_outer_ring_road_exit_point_in_km","label":"MINJUR - OUTER RING ROAD EXIT - IN KM","visibility":"public","group":"distances","level":2},
{"idx":55,"key":"distance_from_existing_facility_or_client_specific_location","label":"DISTANCE FROM EXISTING FACILITY OR CLIENT SPECIFIC LOCATION","visibility":"public","group":"distances","level":2},
{"idx":56,"key":"telecalling_status","label":"TELECALLING STATUS","visibility":"internal","group":"telecalling","level":3},
{"idx":57,"key":"date_of_tele_calling","label":"DATE OF TELE-CALLING","visibility":"internal","group":"telecalling","level":3},
{"idx":58,"key":"ibr_telecalling_note_book_no","label":"IBR TELECALLING NOTE BOOK #","visibility":"internal","group":"telecalling","level":3},
{"idx":59,"key":"ibr_telecalling_note_book_page_no","label":"IBR TELECALLING NOTE BOOK PAGE #","visibility":"internal","group":"telecalling","level":3},
{"idx":60,"key":"landmark","label":"LANDMARK","visibility":"internal","group":"telecalling","level":3},
{"idx":61,"key":"width_of_the_road_in_front_of_the_site_in_feet","label":"WIDTH OF THE ROAD - IN FRONT OF THE SITE - IN FEET","visibility":"public","group":"building","level":2},
{"idx":62,"key":"developer_name","label":"DEVELOPER NAME","visibility":"internal","group":"building","level":3},
{"idx":63,"key":"building_availability","label":"BUILDING AVAILABILITY","visibility":"internal","group":"building","level":1},
{"idx":64,"key":"age_of_the_building_in_years","label":"AGE OF THE BUILDING - IN YEARS","visibility":"internal","group":"building","level":3},
{"idx":65,"key":"tentative_possession_schedule_in_months","label":"TENTATIVE POSSESSION SCHEDULE - IN MONTHS","visibility":"internal","group":"building","level":3},
{"idx":66,"key":"floor_offered","label":"FLOOR OFFERED","visibility":"public","group":"building","level":2},
{"idx":67,"key":"shop_floor_ceiling_type","label":"SHOP FLOOR CEILING TYPE","visibility":"public","group":"building","level":2},
{"idx":68,"key":"center_ceiling_height_in_feet","label":"CENTER CEILING HEIGHT - IN FEET","visibility":"public","group":"building","level":1},
{"idx":69,"key":"electricty_power_available_and_type","label":"ELECTRICITY POWER AVAILABLE AND TYPE","visibility":"public","group":"building","level":2},
{"idx":70,"key":"back_up_power","label":"BACK UP POWER","visibility":"internal","group":"site_inspection","level":3},
{"idx":71,"key":"for_site_visit_contact_person_name_from_owner_developer_side","label":"SITE VISIT CONTACT PERSON - OWNER/DEVELOPER","visibility":"internal","group":"site_inspection","level":3},
{"idx":72,"key":"for_site_visit_contact_persons_designation","label":"SITE VISIT CONTACT PERSON - DESIGNATION","visibility":"internal","group":"site_inspection","level":3},
{"idx":73,"key":"for_site_visit_contact_persons_site_phone","label":"SITE VISIT CONTACT - SITE PHONE","visibility":"internal","group":"site_inspection","level":3},
{"idx":74,"key":"for_site_visit_contact_persons_mobile","label":"SITE VISIT CONTACT - MOBILE","visibility":"internal","group":"site_inspection","level":3},
{"idx":75,"key":"contact_persons_email_id","label":"CONTACT PERSON EMAIL ID","visibility":"internal","group":"site_inspection","level":3},
{"idx":76,"key":"inspection_date","label":"INSPECTION DATE","visibility":"internal","group":"site_inspection","level":3},
{"idx":77,"key":"name_of_the_lbr_executive_inspected_facility","label":"LBR EXECUTIVE WHO INSPECTED FACILITY","visibility":"internal","group":"site_inspection","level":3},
{"idx":78,"key":"site_google_co_ordinates","label":"SITE GOOGLE CO-ORDINATES","visibility":"internal","group":"site_inspection","level":3},
{"idx":79,"key":"facility_address","label":"FACILITY ADDRESS","visibility":"internal","group":"site_inspection","level":3},
{"idx":80,"key":"rail_connectivity","label":"RAIL CONNECTIVITY","visibility":"internal","group":"site_inspection","level":3},
{"idx":81,"key":"nearest_railway_station_and_distance","label":"NEAREST RAILWAY STATION & DISTANCE","visibility":"internal","group":"site_inspection","level":3},
{"idx":82,"key":"primary_access_road_width_in_feet","label":"PRIMARY ACCESS ROAD WIDTH - IN FEET","visibility":"internal","group":"site_inspection","level":3},
{"idx":83,"key":"secondary_access_road_in_feet","label":"SECONDARY ACCESS ROAD - IN FEET","visibility":"internal","group":"site_inspection","level":3},
{"idx":84,"key":"tertiary_access_road_in_feet","label":"TERTIARY ACCESS ROAD - IN FEET","visibility":"internal","group":"site_inspection","level":3},
{"idx":85,"key":"distance_from_primary_access_road_in_km","label":"DISTANCE FROM PRIMARY ACCESS ROAD - IN KM","visibility":"internal","group":"site_inspection","level":3},
{"idx":86,"key":"plot_facing","label":"PLOT FACING","visibility":"internal","group":"site_inspection","level":3},
{"idx":87,"key":"building_facility_main_entrance_facing","label":"BUILDING / FACILITY MAIN ENTRANCE FACING","visibility":"internal","group":"site_inspection","level":3},
{"idx":88,"key":"exclusivity","label":"EXCLUSIVITY","visibility":"internal","group":"site_inspection","level":3},
{"idx":89,"key":"co_tenants_name","label":"CO-TENANT NAME","visibility":"internal","group":"site_inspection","level":3},
{"idx":90,"key":"office_in_ground_floor_size","label":"OFFICE IN GROUND FLOOR - SIZE","visibility":"internal","group":"site_inspection","level":3},
{"idx":91,"key":"office_in_mezzanine_floor_size","label":"OFFICE IN MEZZANINE FLOOR - SIZE","visibility":"internal","group":"site_inspection","level":3},
{"idx":92,"key":"office_in_first_floor_size","label":"OFFICE IN FIRST FLOOR - SIZE","visibility":"internal","group":"site_inspection","level":3},
{"idx":93,"key":"office_in_second_floor_size","label":"OFFICE IN SECOND FLOOR - SIZE","visibility":"internal","group":"site_inspection","level":3},
{"idx":94,"key":"office_ceiling_type","label":"OFFICE CEILING TYPE","visibility":"internal","group":"site_inspection","level":3},
{"idx":95,"key":"office_cabin_partitions","label":"OFFICE CABIN / PARTITIONS","visibility":"internal","group":"site_inspection","level":3},
{"idx":96,"key":"office_interior_fit_outs","label":"OFFICE INTERIOR FIT-OUTS","visibility":"internal","group":"site_inspection","level":3},
{"idx":97,"key":"availability_of_reception","label":"AVAILABILITY OF RECEPTION","visibility":"internal","group":"site_inspection","level":3},
{"idx":98,"key":"shop_floor_dimension","label":"SHOP FLOOR DIMENSION","visibility":"public","group":"shopfloor","level":2},
{"idx":99,"key":"shop_floor_side_eve_height_in_feet","label":"SHOP FLOOR SIDE / EVE HEIGHT - IN FEET","visibility":"public","group":"shopfloor","level":2},
{"idx":100,"key":"shop_floor_height_below_beam_truss_in_feet","label":"SHOP FLOOR HEIGHT - BELOW BEAM / TRUSS - IN FEET","visibility":"public","group":"shopfloor","level":2},
{"idx":101,"key":"exhaust_fan","label":"EXHAUST FAN","visibility":"public","group":"shopfloor","level":2},
{"idx":102,"key":"windows","label":"WINDOWS","visibility":"public","group":"shopfloor","level":2},
{"idx":103,"key":"shop_floor_flooring","label":"SHOP FLOOR - FLOORING","visibility":"public","group":"shopfloor","level":2},
{"idx":104,"key":"floor_load_bearing_capacity_in_metric_ton_per_sq_mt","label":"FLOOR LOAD BEARING CAPACITY - MT/SQ.MT","visibility":"public","group":"shopfloor","level":2},
{"idx":105,"key":"pillars_columns","label":"PILLARS / COLUMNS","visibility":"public","group":"shopfloor","level":2},
{"idx":106,"key":"span_between_pillars_in_feet","label":"SPAN BETWEEN PILLARS - IN FEET","visibility":"public","group":"shopfloor","level":2},
{"idx":107,"key":"shutters_type","label":"SHUTTERS TYPE","visibility":"public","group":"shopfloor","level":2},
{"idx":108,"key":"front_shutter_i_height_in_feet","label":"FRONT SHUTTER I - HEIGHT - IN FEET","visibility":"public","group":"shopfloor","level":2},
{"idx":109,"key":"front_shutter_i_width_in_feet","label":"FRONT SHUTTER I - WIDTH - IN FEET","visibility":"public","group":"shopfloor","level":2},
{"idx":110,"key":"front_shutter_ii_height_in_feet","label":"FRONT SHUTTER II - HEIGHT - IN FEET","visibility":"public","group":"shopfloor","level":2},
{"idx":111,"key":"front_shutter_ii_width_in_feet","label":"FRONT SHUTTER II - WIDTH - IN FEET","visibility":"public","group":"shopfloor","level":2},
{"idx":128,"key":"is_loading_area_covered_with_canopy","label":"IS LOADING AREA COVERED WITH CANOPY","visibility":"public","group":"utilities","level":2},
{"idx":129,"key":"number_of_loading_ramps_and_type_of_ramps","label":"NUMBER OF LOADING RAMPS AND TYPE","visibility":"public","group":"utilities","level":2},
{"idx":130,"key":"ramp_for_forklift","label":"RAMP FOR FORKLIFT","visibility":"public","group":"utilities","level":2},
{"idx":131,"key":"raw_materials_entrance_availability","label":"RAW MATERIALS ENTRANCE AVAILABILITY","visibility":"public","group":"utilities","level":2},
{"idx":132,"key":"finished_goods_exit_availability","label":"FINISHED GOODS EXIT AVAILABILITY","visibility":"public","group":"utilities","level":2},
{"idx":133,"key":"crane","label":"CRANE","visibility":"public","group":"utilities","level":2},
{"idx":134,"key":"crane_type_and_capacity","label":"CRANE TYPE & CAPACITY","visibility":"public","group":"utilities","level":2},
{"idx":135,"key":"provision_to_install_crane","label":"PROVISION TO INSTALL CRANE","visibility":"public","group":"utilities","level":2},
{"idx":136,"key":"is_industrial_lamps_provided","label":"IS INDUSTRIAL LAMPS PROVIDED","visibility":"public","group":"utilities","level":2},
{"idx":137,"key":"electricty_power_availability_in_kva","label":"ELECTRICITY POWER AVAILABILITY - IN KVA","visibility":"public","group":"utilities","level":2},
{"idx":138,"key":"electricty_power_available_capacity_in_kva","label":"ELECTRICITY POWER AVAILABLE CAPACITY - IN KVA","visibility":"public","group":"utilities","level":2},
{"idx":139,"key":"back_up_power_availability","label":"BACK UP POWER AVAILABILITY","visibility":"public","group":"utilities","level":2},
{"idx":140,"key":"backup_power_available_capacity_in_kva","label":"BACKUP POWER AVAILABLE CAPACITY - IN KVA","visibility":"public","group":"utilities","level":2},
{"idx":141,"key":"generator_room","label":"GENERATOR ROOM","visibility":"public","group":"utilities","level":2},
{"idx":142,"key":"power_transformer_availability","label":"POWER TRANSFORMER AVAILABILITY","visibility":"public","group":"utilities","level":2},
{"idx":143,"key":"power_transformer_available_capacity_in_kva","label":"POWER TRANSFORMER AVAILABLE CAPACITY - IN KVA","visibility":"public","group":"utilities","level":2},
{"idx":144,"key":"power_room_availability","label":"POWER ROOM AVAILABILITY","visibility":"public","group":"utilities","level":2},
{"idx":145,"key":"compressed_air_lines_in_shop_floor","label":"COMPRESSED AIR LINES IN SHOP FLOOR","visibility":"public","group":"utilities","level":2},
{"idx":146,"key":"etp_effluent_treatment_plant_availability","label":"ETP - EFFLUENT TREATMENT PLANT","visibility":"public","group":"utilities","level":2},
{"idx":147,"key":"rain_water_harvesting_system","label":"RAIN WATER HARVESTING SYSTEM","visibility":"public","group":"utilities","level":2},
{"idx":148,"key":"r_o_plant","label":"R.O. PLANT","visibility":"public","group":"utilities","level":2},
{"idx":149,"key":"water_for_production","label":"WATER FOR PRODUCTION","visibility":"public","group":"utilities","level":2},
{"idx":150,"key":"water_for_toilets","label":"WATER FOR TOILETS","visibility":"public","group":"utilities","level":2},
{"idx":151,"key":"avaialability_of_government_water","label":"AVAILABILITY OF GOVERNMENT WATER","visibility":"public","group":"utilities","level":2},
{"idx":152,"key":"borewell_capacity","label":"BOREWELL CAPACITY","visibility":"public","group":"utilities","level":2},
{"idx":153,"key":"water_sump_capacity_in_kilo_litres","label":"WATER SUMP CAPACITY - IN KILO LITRES","visibility":"public","group":"utilities","level":2},
{"idx":154,"key":"over_head_tank_capacity_in_kilo_litres","label":"OVER HEAD TANK CAPACITY - IN KILO LITRES","visibility":"public","group":"utilities","level":2},
{"idx":155,"key":"executives_cafteria","label":"EXECUTIVES CAFETERIA","visibility":"public","group":"amenities","level":2},
{"idx":156,"key":"crech","label":"CRÈCHE","visibility":"public","group":"amenities","level":2},
{"idx":157,"key":"first_aid_room","label":"FIRST AID ROOM","visibility":"public","group":"amenities","level":2},
{"idx":158,"key":"in_house_clinic","label":"IN-HOUSE CLINIC","visibility":"public","group":"amenities","level":2},
{"idx":159,"key":"provision_of_rain_water_drain","label":"PROVISION OF RAIN WATER DRAIN","visibility":"public","group":"amenities","level":2},
{"idx":160,"key":"drainage_availability","label":"DRAINAGE AVAILABILITY","visibility":"public","group":"amenities","level":2},
{"idx":161,"key":"septic_tank_availability","label":"SEPTIC TANK AVAILABILITY","visibility":"public","group":"amenities","level":2},
{"idx":162,"key":"septic_tank_capacity_in_litres","label":"SEPTIC TANK CAPACITY - IN LITRES","visibility":"public","group":"amenities","level":2},
{"idx":163,"key":"sewage_treatment_plant","label":"SEWAGE TREATMENT PLANT","visibility":"public","group":"amenities","level":2},
{"idx":164,"key":"lawn_and_garden","label":"LAWN & GARDEN","visibility":"public","group":"amenities","level":2},
{"idx":165,"key":"toilets_for_workers","label":"TOILETS FOR WORKERS","visibility":"public","group":"amenities","level":2},
{"idx":166,"key":"toilets_for_executives","label":"TOILETS FOR EXECUTIVES","visibility":"public","group":"amenities","level":2},
{"idx":167,"key":"security_room","label":"SECURITY ROOM","visibility":"public","group":"amenities","level":2},
{"idx":168,"key":"open_area_for_scrap","label":"OPEN AREA FOR SCRAP","visibility":"public","group":"amenities","level":2},
{"idx":169,"key":"feasibility_of_truck_movement_around_facility","label":"TRUCK MOVEMENT FEASIBILITY AROUND FACILITY","visibility":"public","group":"amenities","level":2},
{"idx":170,"key":"truck_parking_facility_for_40_feet_containers","label":"TRUCK PARKING - 40 FEET CONTAINERS","visibility":"public","group":"amenities","level":2},
{"idx":171,"key":"total_number_of_sheds_built_in_this_project","label":"TOTAL NUMBER OF SHEDS IN PROJECT","visibility":"public","group":"compliance","level":2},
{"idx":172,"key":"total_built_up_area_in_sq_ft","label":"TOTAL BUILT UP AREA - IN SQ.FT","visibility":"public","group":"compliance","level":2},
{"idx":173,"key":"scalability","label":"SCALABILITY","visibility":"public","group":"compliance","level":2},
{"idx":174,"key":"land_zone_classification","label":"LAND ZONE CLASSIFICATION","visibility":"public","group":"compliance","level":2},
{"idx":175,"key":"is_building_approved","label":"IS BUILDING APPROVED","visibility":"public","group":"compliance","level":2},
{"idx":176,"key":"building_construction_approved_by","label":"BUILDING CONSTRUCTION APPROVED BY","visibility":"public","group":"compliance","level":2},
{"idx":177,"key":"site_pictures_capturing","label":"SITE PICTURES CAPTURING","visibility":"public","group":"compliance","level":2},
{"idx":178,"key":"preparation_of_rough_sketch_of_facility_by_lbr_executive","label":"ROUGH SKETCH OF FACILITY BY LBR EXECUTIVE","visibility":"public","group":"compliance","level":2},
{"idx":179,"key":"lamp_types","label":"LAMP TYPES","visibility":"public","group":"compliance","level":2},
{"idx":180,"key":"status_of_plot_level_height_increased_from_abutting_road","label":"PLOT LEVEL HEIGHT STATUS FROM ABUTTING ROAD","visibility":"public","group":"compliance","level":2},
{"idx":181,"key":"front_open_area_flooring","label":"FRONT OPEN AREA FLOORING","visibility":"public","group":"compliance","level":2},
{"idx":182,"key":"phone_connection_availability","label":"PHONE CONNECTION AVAILABILITY","visibility":"public","group":"compliance","level":2},
{"idx":183,"key":"internet_connection_availability","label":"INTERNET CONNECTION AVAILABILITY","visibility":"public","group":"compliance","level":2},
{"idx":184,"key":"collection_of_approved_floor_plans_hard_copy","label":"COLLECTION OF APPROVED FLOOR PLANS HARD COPY","visibility":"public","group":"compliance","level":2},
{"idx":185,"key":"near_by_prominent_industries","label":"NEARBY PROMINENT INDUSTRIES","visibility":"public","group":"compliance","level":2},
{"idx":186,"key":"advertiser_profile","label":"ADVERTISER PROFILE","visibility":"internal","group":"advertisement","level":3},
{"idx":187,"key":"advertiser_office_address","label":"ADVERTISER OFFICE ADDRESS","visibility":"internal","group":"advertisement","level":3},
{"idx":188,"key":"site_category","label":"SITE CATEGORY","visibility":"internal","group":"commercial","level":3},
{"idx":189,"key":"ownership","label":"OWNERSHIP","visibility":"internal","group":"commercial","level":3},
{"idx":190,"key":"ifrsd_interest_free_refundable_security_deposit","label":"IFRSD - INTEREST FREE REFUNDABLE SECURITY DEPOSIT","visibility":"internal","group":"commercial","level":3},
{"idx":191,"key":"maintenance_charges_per_sq_ft","label":"MAINTENANCE CHARGES PER SQ.FT","visibility":"internal","group":"commercial","level":3},
{"idx":192,"key":"industrial_estate_additional_charges_per_sq_ft","label":"INDUSTRIAL ESTATE - ADDITIONAL CHARGES PER SQ.FT","visibility":"internal","group":"commercial","level":3},
{"idx":193,"key":"rent_for_vacant_land_per_sq_ft","label":"RENT FOR VACANT LAND - PER SQ.FT","visibility":"internal","group":"commercial","level":3},
{"idx":194,"key":"rent_for_infrastructure_per_sq_ft","label":"RENT FOR INFRASTRUCTURE - PER SQ.FT","visibility":"internal","group":"commercial","level":3},
{"idx":195,"key":"rent_for_electricity_power_per_sq_ft","label":"RENT FOR ELECTRICITY POWER - PER SQ.FT","visibility":"internal","group":"commercial","level":3},
{"idx":196,"key":"rent_for_backup_power_per_sq_ft","label":"RENT FOR BACKUP POWER - PER SQ.FT","visibility":"internal","group":"commercial","level":3},
{"idx":197,"key":"rental_escalation_duration_in_years","label":"RENTAL ESCALATION DURATION - IN YEARS","visibility":"internal","group":"commercial","level":3},
{"idx":198,"key":"rental_escalation_percentage","label":"RENTAL ESCALATION PERCENTAGE","visibility":"internal","group":"commercial","level":3},
{"idx":199,"key":"rent_free_fitment_period_in_days","label":"RENT FREE FITMENT PERIOD - IN DAYS","visibility":"internal","group":"commercial","level":3},
{"idx":200,"key":"rent_commencement_date","label":"RENT COMMENCEMENT DATE","visibility":"internal","group":"commercial","level":3},
{"idx":201,"key":"fmb_drawing_pertaining_to_land","label":"FMB DRAWING - PERTAINING TO LAND","visibility":"public","group":"compliance","level":2},
{"idx":202,"key":"patta_pertaining_to_land","label":"PATTA - PERTAINING TO LAND","visibility":"public","group":"compliance","level":2},
{"idx":203,"key":"building_plan_sanction","label":"BUILDING PLAN SANCTION","visibility":"public","group":"compliance","level":2},
{"idx":204,"key":"structural_drawing","label":"STRUCTURAL DRAWING","visibility":"public","group":"compliance","level":2}
];

// ORS Transact Listing type (all 205 fields as optional strings + metadata)
export interface OrsTransactListing {
  id: string;                          // Firestore doc ID
  ors_property_id: string;             // ORS 00001, ORS 00002 etc
  listingMode: 'ors_transact' | 'dual'; // dual = also on direct deal
  createdBy: string;                   // admin email
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
  pictureUrls?: string[];              // multiple picture URLs
  [key: string]: any;                  // all 205 CSV fields
}
