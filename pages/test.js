$(document).ready(() => {
  $('#ajaxTest').click(() => alert("worked"));
  $('#destinationForm').submit(() => {
    const destination = {
      name: $('#destinationName')[0].value,
      address: $('#destinationAddress')[0].value
    }
    $.ajax({
      url: '/mileage/destination',
      type: 'post',
      contentType: 'application/json',
      success: () => {
        $('#updateStatus').text('success');
      },
      error: () => {
        console.log('error');
        $('#updateStatus').text('There was an isssue');
      },
      data: JSON.stringify(destination)
    });
    return false;
  });
})
