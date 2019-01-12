  let tableRow = 0;
$(document).ready(() => {
  populateDestinationRows();
  populateMetadata();
  $('#ajaxTest').click(() => {
    $.ajax({
      url: '/mileage/metadata',
      type: 'delete',
      success: () => {
        console.log('successfully deleted data');
      },
      error: () => {
        console.log('error deleting data');
      }
    })
  });
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
        console.log('error');
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
    console.log(mileageMetadata);
    $.ajax({
      url: '/mileage/metadata',
      type: 'post',
      contentType: 'application/json',
      success: () => {
        console.log('success');
        $('#metadataStatus').text('success');
      },
      error: () => {
        console.log('failure');
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
      console.log('population thing failed');
    }
  });
}

const populateMetadata = () => {
  $.ajax({
    url: '/mileage/metadata',
    type: 'GET',
    success: (data) => {
      $('#startMileage').val(data.startMileage);
      $('#endMileage').val(data.endMileage);
      console.log(data);
    },
    error: () => {
      console.log('Error calling metadata');
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

