/* ---------------------------- GET LOCATION INFO --------------------------- */
function getLocationInfo(target) {
      console.log(target);

      fetch('/auth/club/get_location_info', {
            method: 'POST',
            headers: {
                  'Content-Type': 'application/json'
            },
            body: JSON.stringify({ Site_Name: target })
      }).then(res => res.json())
            .then(res => {
                  console.log(res)

                  let data = { ...res.siteInfo, ...res.emergencyPlanInfo };
                  console.log(data);
                  modifyLocation(data);
            })
}


/* -------------------------- MODIFY LCOATION INFO -------------------------- */
function modifyLocation(data) {
      fetch('/auth/club/locations', {
            method: 'PUT',
            headers: {
                  'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
      }).then(res => res.json())
            .then(res => console.log(res))
}