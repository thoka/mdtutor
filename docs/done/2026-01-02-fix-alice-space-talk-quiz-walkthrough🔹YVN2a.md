# Walkthrough - Alice space-talk quiz fix 🔹YVN2a

This document details the fix for Alice's `space-talk` project completion, specifically adding the missing quiz entries.

## Changes

### 1. API Test (`packages/backend-ruby/spec/requests/api/v1/alice_progress_spec.rb`)
Added a new test case to verify that Alice has completed the quiz for the `space-talk` project. This test checks the aggregated state endpoint.

```ruby
    it "has 100% progress for space-talk including the quiz" do
      get "/api/v1/actions/user/#{alice_id}/state"
      expect(response).to have_http_status(:ok)

      state = JSON.parse(response.body)
      project_state = state["projects"]["RPL:PROJ:space-talk"]
      expect(project_state).to be_present
      
      # Step 6 is the quiz step in space-talk
      expect(project_state["quizzes"]).to include(6)
    end
```

### 2. Backend Seeds (`packages/backend-ruby/db/seeds.rb`)
Updated the seeding logic for Alice's `space-talk` project to include `quiz_attempt` and `quiz_success` actions for step 6.

```ruby
  # Special handling for Quiz in step 6
  if step == 6
    (0..2).each do |q_idx|
      TrackActionService.call(
        user_id: alice_id,
        action: "quiz_attempt",
        gid: space_talk_gid,
        metadata: { step: step, question_index: q_idx, is_correct: true },
        timestamp: Time.current - (10 - step).days + 1.minute + q_idx.seconds
      )
      TrackActionService.call(
        user_id: alice_id,
        action: "quiz_success",
        gid: space_talk_gid,
        metadata: { step: step, question_index: q_idx },
        timestamp: Time.current - (10 - step).days + 1.minute + q_idx.seconds + 1.second
      )
    end
  end
```

## Verification

1.  Ran `npm run seed:test` to update the test database.
2.  Ran `RAILS_ENV=test bundle exec rspec spec/requests/api/v1/alice_progress_spec.rb` in `packages/backend-ruby`.
3.  All tests passed, including the new `space-talk` quiz verification.

