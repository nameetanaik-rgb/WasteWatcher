
const wasteDisposalGuidance = {
  compostables: {
    title: "Compostable Waste",
    instructions: [
      "Separate organic waste from plastic and other non-biodegradable materials.",
      "Add suitable food and garden waste to a compost bin.",
      "Avoid adding contaminated or chemically treated materials.",
    ],
    destination: "Home composting or an authorised organic waste collection facility.",
  },

  compostables_vegetation: {
    title: "Vegetation Waste",
    instructions: [
      "Collect leaves, grass and small plant trimmings separately.",
      "Remove plastic, stones and other contaminants.",
      "Use suitable material for composting.",
    ],
    destination: "Garden composting or municipal green-waste collection.",
  },

  hazardous_batteries: {
    title: "Used Batteries",
    instructions: [
      "Keep used batteries separate from household waste.",
      "Avoid crushing, puncturing or opening batteries.",
      "Protect exposed terminals from contact with metal objects.",
    ],
    destination: "An authorised battery collection or recycling centre.",
  },

  "hazardous_e-waste": {
    title: "Electronic Waste",
    instructions: [
      "Keep electronic waste separate from regular garbage.",
      "Do not dismantle or burn electronic components.",
      "Remove personal data from devices before handing them over.",
    ],
    destination: "An authorised e-waste collection centre or recycler.",
  },

  hazardous_medical_gloves: {
    title: "Medical Gloves",
    instructions: [
      "Do not mix used medical gloves with recyclable household materials.",
      "Avoid direct contact with contaminated gloves.",
      "Follow the applicable biomedical waste segregation procedure.",
    ],
    destination: "An authorised biomedical waste collection service.",
  },

  hazardous_medical_masks: {
    title: "Medical Masks",
    instructions: [
      "Avoid touching the used mask unnecessarily.",
      "Do not reuse disposable masks.",
      "Dispose of contaminated masks according to local biomedical waste instructions.",
    ],
    destination: "An appropriate municipal or authorised biomedical waste collection stream, depending on contamination and local rules.",
  },

  hazardous_medical_medicines: {
    title: "Unused or Expired Medicines",
    instructions: [
      "Keep medicines away from children and pets.",
      "Do not pour medicines into drains or water bodies.",
      "Do not mix medicines with ordinary recyclable waste.",
    ],
    destination: "A pharmacy take-back programme or authorised pharmaceutical waste collection facility, where available.",
  },

  hazardous_medical_syringe: {
    title: "Used Syringes",
    instructions: [
      "Never recap, bend or break a used needle.",
      "Do not place loose syringes in household garbage.",
      "Keep sharps in an approved puncture-resistant sharps container.",
    ],
    destination: "An authorised biomedical waste collection service.",
  },

  hazardous_paints: {
    title: "Paint Waste",
    instructions: [
      "Keep leftover paint in its original labelled container.",
      "Do not pour paint into drains, soil or water bodies.",
      "Keep paint away from flames and heat.",
    ],
    destination: "A local hazardous waste collection facility or approved paint take-back programme.",
  },

  hazardous_pesticides: {
    title: "Pesticide Waste",
    instructions: [
      "Do not reuse pesticide containers for food or drinking water.",
      "Do not pour leftover pesticide into drains or soil.",
      "Keep containers sealed and away from children and animals.",
    ],
    destination: "An authorised pesticide or hazardous waste collection facility. Follow the product label instructions.",
  },

  landfill_ceramic_product: {
    title: "Ceramic Products",
    instructions: [
      "Separate broken ceramics from recyclable glass.",
      "Wrap sharp fragments securely to prevent injuries.",
      "Keep the material separate from ordinary recyclables.",
    ],
    destination: "A municipal construction or residual waste collection facility, as locally permitted.",
  },

  landfill_diapers: {
    title: "Disposable Diapers",
    instructions: [
      "Wrap used diapers securely.",
      "Keep them separate from recyclable and compostable waste.",
      "Do not place them in ordinary recycling bins.",
    ],
    destination: "The designated residual or sanitary waste collection stream.",
  },

  landfill_platics_bags_wrappers: {
    title: "Plastic Bags and Wrappers",
    instructions: [
      "Remove food residue where practical.",
      "Keep dirty or multilayer wrappers separate from accepted recyclable plastics.",
      "Check whether your local recycler accepts flexible packaging.",
    ],
    destination: "An appropriate plastic collection programme or designated residual waste stream.",
  },

  landfill_sanitary_napkin: {
    title: "Sanitary Napkins",
    instructions: [
      "Wrap used sanitary products securely.",
      "Do not flush them down toilets.",
      "Keep them separate from recyclable and compostable waste.",
    ],
    destination: "The designated sanitary waste collection stream under local municipal guidance.",
  },

  landfill_stroform_product: {
    title: "Styrofoam Products",
    instructions: [
      "Keep foam packaging separate from ordinary plastic recyclables.",
      "Remove food contamination where practical.",
      "Check whether a local collection centre accepts expanded polystyrene.",
    ],
    destination: "A specialised foam recycling facility where available, otherwise the designated residual waste stream.",
  },

  recyclables_beverage_cans: {
    title: "Beverage Cans",
    instructions: [
      "Empty the can completely.",
      "Rinse away remaining liquid if needed.",
      "Keep cans dry and separate from general waste.",
    ],
    destination: "An authorised metal recycling collection point.",
  },

  recyclables_cardboard: {
    title: "Cardboard",
    instructions: [
      "Remove tape, plastic wrapping and other contaminants.",
      "Keep cardboard clean and dry.",
      "Flatten boxes to save storage space.",
    ],
    destination: "Paper and cardboard recycling collection.",
  },

  recyclables_construction_scrap: {
    title: "Construction Scrap",
    instructions: [
      "Separate metal, wood, concrete and other materials.",
      "Keep sharp or heavy pieces secured.",
      "Do not mix construction debris with household recyclables.",
    ],
    destination: "An authorised construction and demolition waste collection facility.",
  },

  recyclables_electrical_cables: {
    title: "Electrical Cables",
    instructions: [
      "Keep cables separate from general waste.",
      "Do not burn cables to recover metal.",
      "Avoid cutting or stripping cables yourself.",
    ],
    destination: "An authorised electrical or e-waste recycling facility.",
  },

  recyclables_electronic_chips: {
    title: "Electronic Chips",
    instructions: [
      "Keep electronic components dry and protected.",
      "Avoid breaking or dismantling circuit components.",
      "Store separately from ordinary recyclable materials.",
    ],
    destination: "An authorised e-waste recycling facility.",
  },

  recyclables_glass: {
    title: "Glass",
    instructions: [
      "Separate glass from ceramics and other materials.",
      "Rinse containers and remove food residue.",
      "Wrap broken glass securely and follow local collection instructions.",
    ],
    destination: "A glass recycling collection point that accepts the specific type of glass.",
  },

  recyclables_laptops: {
    title: "Laptops",
    instructions: [
      "Back up and erase personal data before disposal.",
      "Keep the device and its battery intact.",
      "Do not dismantle or burn electronic components.",
    ],
    destination: "An authorised e-waste collection or take-back centre.",
  },

  recyclables_metal_containers: {
    title: "Metal Containers",
    instructions: [
      "Empty the container completely.",
      "Rinse it if necessary and allow it to dry.",
      "Check that the container is accepted by your local metal recycler.",
    ],
    destination: "An authorised metal recycling collection point.",
  },

  recyclables_miscellaneous_trash: {
    title: "Miscellaneous Recyclables",
    instructions: [
      "Identify the material before deciding how to dispose of it.",
      "Separate metal, paper, plastic and other materials where possible.",
      "Do not assume an unidentified item is recyclable.",
    ],
    destination: "A material-specific collection point after the item has been identified.",
  },

  recyclables_news_paper: {
    title: "Newspapers",
    instructions: [
      "Keep newspapers clean and dry.",
      "Remove plastic covers and other non-paper materials.",
      "Bundle newspapers for collection.",
    ],
    destination: "Paper recycling collection.",
  },

  recyclables_other_metal_objects: {
    title: "Other Metal Objects",
    instructions: [
      "Separate metal objects from other waste.",
      "Remove non-metal attachments where safely possible.",
      "Keep sharp metal edges secured.",
    ],
    destination: "An authorised scrap-metal recycling collection point.",
  },

  recyclables_paper: {
    title: "Paper",
    instructions: [
      "Keep paper clean and dry.",
      "Remove plastic covers, clips and other contaminants where practical.",
      "Separate heavily contaminated paper from recyclable paper.",
    ],
    destination: "Paper recycling collection.",
  },

  recyclables_paper_cups: {
    title: "Paper Cups",
    instructions: [
      "Empty the cup and remove leftover liquid.",
      "Check whether the cup has a plastic lining.",
      "Recycle only through a facility that accepts that type of cup.",
    ],
    destination: "A specialised paper cup collection programme where available.",
  },

  recyclables_plastic: {
    title: "Plastic",
    instructions: [
      "Identify the plastic type if a recycling symbol is available.",
      "Clean and dry the material where practical.",
      "Separate different plastic types according to local collection rules.",
    ],
    destination: "An authorised plastic recycling collection point.",
  },

  recyclables_plastic_bags: {
    title: "Plastic Bags",
    instructions: [
      "Empty the bags and remove visible contaminants.",
      "Keep bags clean and dry.",
      "Check whether your local collection centre accepts flexible plastics.",
    ],
    destination: "A plastic film collection programme where available.",
  },

  recyclables_plastic_bottles: {
    title: "Plastic Bottles",
    instructions: [
      "Empty the bottle completely.",
      "Rinse and dry it.",
      "Separate the cap if required by your local recycler.",
    ],
    destination: "An authorised plastic bottle recycling collection point.",
  },

  recyclables_plastic_containers: {
    title: "Plastic Containers",
    instructions: [
      "Empty containers and remove leftover contents.",
      "Rinse and dry them where practical.",
      "Check the plastic type and local recycling requirements.",
    ],
    destination: "An authorised plastic recycling collection point.",
  },

  recyclables_plastic_cups: {
    title: "Plastic Cups",
    instructions: [
      "Empty the cup and rinse away residue.",
      "Allow it to dry.",
      "Check whether your local recycler accepts that plastic type.",
    ],
    destination: "An accepted plastic recycling collection point.",
  },

  recyclables_small_appliances: {
    title: "Small Appliances",
    instructions: [
      "Switch off and unplug the appliance.",
      "Remove batteries only if they are designed to be safely removable.",
      "Do not dismantle electrical components.",
    ],
    destination: "An authorised e-waste collection or take-back centre.",
  },

  recyclables_smartphones: {
    title: "Smartphones",
    instructions: [
      "Back up and erase your personal data.",
      "Sign out of accounts and remove SIM and memory cards.",
      "Keep the battery intact and avoid damaging the device.",
    ],
    destination: "An authorised e-waste collection or manufacturer take-back programme.",
  },

  recyclables_spray_cans: {
    title: "Spray Cans",
    instructions: [
      "Do not puncture, crush or burn aerosol cans.",
      "Keep cans away from heat and flames.",
      "Follow the product label and local hazardous waste collection instructions.",
    ],
    destination: "An appropriate authorised aerosol or hazardous waste collection facility.",
  },

  recyclables_tetra_pak: {
    title: "Tetra Pak Cartons",
    instructions: [
      "Empty the carton completely.",
      "Rinse it and allow excess liquid to drain.",
      "Flatten it if requested by the collection programme.",
    ],
    destination: "A collection centre that accepts multilayer beverage cartons.",
  },
};

export default wasteDisposalGuidance;
