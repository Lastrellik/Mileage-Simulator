  let tableRow = 0;
$(document).ready(() => {
  populateDestinationRows();
  populateMetadata();
  $('#addDestinationBtn').click(() => {
    const destination = {
      name: $('#destinationName').val(),
      address: $('#destinationAddress').val(),
      startDate: $('#destinationStartDate').val(),
      endDate: $('#destinationEndDate').val(),
      milesFromHome: $('#milesFromHome').val()
    };
    $.ajax({
      url: '/mileage/destination',
      type: 'post',
      contentType: 'application/json',
      success: () => {
        addDestinationRow(destination);
      },
      error: () => {
        $('#updateStatus').text('There was an isssue');
      },
      data: JSON.stringify(destination)
    });
  });
  $('#metadataSubmit').click(() => {
    const mileageMetadata = {
      startMileage: $('#startMileage').val(),
      endMileage: $('#endMileage').val()
    }
    $.ajax({
      url: '/mileage/metadata',
      type: 'post',
      contentType: 'application/json',
      success: () => {
        $('#metadataStatus').text('success');
      },
      error: () => {
        $('#metadataStatus').text('There was an isssue');
      },
      data: JSON.stringify(mileageMetadata)
    });
  });
})

const populateDestinationRows = () => {
  $.ajax({
    url: '/mileage/destination',
    type: 'GET',
    success: (data) => {
      data.forEach(row => addDestinationRow(row));
    },
    error: () => {
      $('#updateStatus').text('Error with populating rows');
    }
  });
}

const getDestinations = (callback) => {
  $.ajax({
    url: '/mileage/destination',
    type: 'GET',
    success: (data) => {
      callback(data);
    },
    error: () => {
      console.log('could not get destination data');
    }
  });
}

const getMetadata = (callback) => {
  $.ajax({
    url: '/mileage/metadata',
    type: 'GET',
    success: (data) => {
      if(data) {
        callback(data);
      }
    },
    error: () => {
      $('#metadataStatus').text('Error calling metadata');
    }
  });
}

const populateMetadata = () => {
  getMetadata((data) => {
    $('#startMileage').val(data.startMileage);
    $('#endMileage').val(data.endMileage);
  });
}

const removeDestinationRow = (destinationRow) => {
  const name = destinationRow.find('td')[0].innerText;
  $.ajax({
    url: '/mileage/destination',
    type: 'DELETE',
    success: () => {
      $('#updateStatus').text('successfully removed row');
    },
    error: () => {
      $('#updateStatus').text('There was an isssue removing row');
    },
    data: {name}

  })
  destinationRow.remove();
}

const addDestinationRow = (destination) => {
  const startDate = new Date(destination.startDate).toUTCString();
  const endDate = new Date (destination.endDate).toUTCString();
  $('#destinationTable').append('<tr id=\'tr' + tableRow + '\'><td>' + destination.name + '</td><td>' + destination.address + '</td><td>' + destination.milesFromHome + '</td><td>' + startDate + '</td><td>' + endDate + '</td><td><button onClick=\'removeDestinationRow($(this).closest("tr"))\' id=\'row'+tableRow +'\'>-</button></tr>');
  $('#updateStatus').text('success');
}

const runSimulation = () => {
  const metadata = {};
  const days = ['Date,Destination,Starting Mileage,Ending Milgeage,Trip Mileage,Work Related\n'];
  getMetadata((data) => {
    metadata.startMileage = data.startMileage;
    metadata.endMileage = data.endMileage;
  });
  getDestinations((data)=> {
    const destinations = [];
    const randomTripMileageVariation = .15;
    let runningMileage = metadata.startMileage;
    data.forEach(dest => destinations.push(dest));
    let milesDrivinThisYear = 0;
    for(let d = new Date(2018, 0, 1); d < new Date(2018, 11, 31); d.setDate(d.getDate() + 1)) {
      if(Math.floor(Math.random() * 100) > 80) {
        continue;
      }
      for(let i = 0; i < 1 + Math.floor(Math.random() * 2); i++) {
        const day = d.getDate();
        const months = d.getMonth() + 1;
        const year = d.getFullYear();
        const randNum = Math.floor(Math.random() * destinations.length);
        const destination = destinations[randNum];
        const date = months + '-' + day + '-' + year;
        const destinationName = destination.name;
        const startingMileage = runningMileage;
        const tripMileage = Math.round(destination.milesFromHome * ((Math.random() * randomTripMileageVariation) + 1));
        const homeTripMileage = Math.round(destination.milesFromHome * ((Math.random() * randomTripMileageVariation) + 1));
        const endMileage = startingMileage + tripMileage;
        const workRelated = "Business";
        const newRow = [date, destinationName, startingMileage, endMileage, tripMileage, workRelated].join(',');
        days.push(newRow + '\n');
        const homeTrip = [date, "Home", endMileage, endMileage + homeTripMileage, homeTripMileage, "travel home"].join(',');
        runningMileage += tripMileage;
        runningMileage += homeTripMileage;
        milesDrivinThisYear += (tripMileage * 2);
        days.push(homeTrip + '\n');
      }
    }
    displaySimulationData(days);
    downloadFile(days);
    displayEndMiles(runningMileage);
    displayTotalMilesDrivin(milesDrivinThisYear);
  });
}

const displaySimulationData = (simulationDays) => {
  $('#displayTable').empty();
  $('#displayTable').append('<tr><th>' + simulationDays[0].split(',').join('</th><th>') + '</th></tr>');
  for(let i = 1; i < simulationDays.length; i++) {
    $('#displayTable').append('<tr><td>' + simulationDays[i].split(',').join('</td><td>') + '</th></tr>');
  }
}

const downloadFile = simulationDays => {
  const planTextData = simulationDays.join('');
  $('#downloadFile').text('Download CSV');
  $('#downloadFile').attr('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(planTextData));
  $('#downloadFile').attr('download', 'mileageData.csv');
}

const displayEndMiles = endMiles => {
  $('#endingActualMiles').text('Final car mileage: ' + endMiles);
}

const displayTotalMilesDrivin = totalMilesDriven => {
  $('#totalMilesDriven').text('Simulated miles driven: ' + totalMilesDriven);
}
