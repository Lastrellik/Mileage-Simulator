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

const populateMetadata = () => {
  $.ajax({
    url: '/mileage/metadata',
    type: 'GET',
    success: (data) => {
      if(data) {
        $('#startMileage').val(data.startMileage);
        $('#endMileage').val(data.endMileage);
      }
    },
    error: () => {
      $('#metadataStatus').text('Error calling metadata');
    }
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

