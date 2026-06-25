# Generated from underwriting.allium#CheckAgainstPolicy by `allium plan` / propagate,
# then vouched for by the underwriter and extended with edge, error and adversarial cases.

Feature: lending-policy-check

  Scenario: Compliant application is assessed with citations
    Given a current policy set and an application in status "received"
    When the underwriter submits the application
    Then every finding cites a policy clause
    And the application status becomes "assessed"

  Scenario: Affordability breach is escalated, not decided
    Given an application that breaches an affordability rule
    When the underwriter submits the application
    Then the assessment flags the breach with its policy clause
    And the application status becomes "escalated"
    And the assessment makes no lending decision

  Scenario: Out-of-date policy set is an explicit error
    Given no policy set marked current
    When the underwriter submits the application
    Then the skill emits a missing-current-policy error
