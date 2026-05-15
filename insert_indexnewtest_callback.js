const fs = require('fs');
const path = 'C:/Users/CasaT/quaerensclaims/public/indexnewtest.html';
let html = fs.readFileSync(path, 'utf8');
const card = `
          <aside class="callback-card" aria-label="Request a call back">
            <h2>Request a call back</h2>
            <p>Leave your details and an intake consultant can help you understand the best starting point.</p>
            <form onsubmit="event.preventDefault(); alert('Thank you. This test callback panel is ready to connect to the CRM when approved.');">
              <label for="testCallbackName">Name</label>
              <input id="testCallbackName" name="name" type="text" autocomplete="name" placeholder="Your full name">
              <label for="testCallbackPhone">Phone</label>
              <input id="testCallbackPhone" name="phone" type="tel" autocomplete="tel" placeholder="Best number to call">
              <label for="testCallbackEmail">Email</label>
              <input id="testCallbackEmail" name="email" type="email" autocomplete="email" placeholder="you@example.com">
              <label for="testCallbackIssue">What do you need help with?</label>
              <select id="testCallbackIssue" name="issue">
                <option value="">Choose a topic</option>
                <option>Travel, flight or luggage issue</option>
                <option>Finance, bank or pension dispute</option>
                <option>Property, solar or timeshare issue</option>
                <option>Digital, cyber or platform issue</option>
                <option>Complaint letter or escalation</option>
              </select>
              <label for="testCallbackTime">Preferred callback time</label>
              <select id="testCallbackTime" name="preferred_time">
                <option>Any time today</option>
                <option>Morning</option>
                <option>Afternoon</option>
                <option>Tomorrow</option>
              </select>
              <button type="submit">Request Call Back</button>
              <p class="callback-note">Test page only: submissions are not connected until this version is approved.</p>
            </form>
          </aside>`;
if (!html.includes('Request a call back')) {
  const needle = `          </div>\n        </div>\n      </div>\n    </section>`;
  if (!html.includes(needle)) throw new Error('Hero insertion point not found');
  html = html.replace(needle, `          </div>${card}\n        </div>\n      </div>\n    </section>`);
}
fs.writeFileSync(path, html, 'utf8');
console.log('callback inserted');
