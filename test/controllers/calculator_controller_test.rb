require "test_helper"

class CalculatorControllerTest < ActionDispatch::IntegrationTest
  test "should get root page" do
    get root_url
    assert_response :success
    assert_match "Revenue Calculator", response.body
  end

  test "accepts optional client name" do
    get root_url(client: "Acme")
    assert_response :success
    assert_match "Pricing for: Acme", response.body
  end
end
