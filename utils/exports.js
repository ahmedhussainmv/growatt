exports.growattUpdater = async function () {
    if (!login) {
      await getLogin();
    }
    let getAllPlantData = await growatt.getAllPlantData(options2).catch((e) => {
      console.log(e);
    });
    // console.log(getAllPlantData);
    try {
      let response = getAllPlantData["213449"]["plantData"];
  
      if (response) {
        let data = {
          dateTime: String(String(new Date()).split(" ")[4]).substr(0, 4),
          eToday: response["eToday"],
          mToday: Math.round(response["mToday"] * 15.42),
          eTotal: response["eTotal"],
          mTotal: Math.round(response["mTotal"] * 15.42),
        };
        db.data.push(data);
        db.plantInfo = {
          plantName: response.plantName,
          plantIsland: response.city,
          plantCountry: response.country,
          createdDate: response.creatDate,
        };
      }
    } catch (e) {
      console.log(e);
    }
    setTimeout(growattUpdater, updateInterval);
  }