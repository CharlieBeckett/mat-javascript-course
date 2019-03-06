Feature: Product managemenet

    Rules:
    1. You must be able to add a Product
    
    
    Background: Ensure a product is in the system
        Given a product doesnt exist
            |name   | description   | price |
            |carrots| orange veggie | 10    |

    Scenario:
        When I add the product
        Then the product is created

        