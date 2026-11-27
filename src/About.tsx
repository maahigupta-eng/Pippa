export default function About() {
  return (
    <article className="legal">
      <h1>About Pippa</h1>
      <p className="lead">
        Pippa carries the method from the course into everyday work. It helps resource mobilisers see what their organisation already has,
        find the partners worth their time, and frame an ask those partners will want to answer.
      </p>

      <h2>Why it exists</h2>
      <p>
        Government aid is shrinking, and fast. Donors change priorities from one year to the next, and every organisation is competing for
        the same pool of money. The organisations that do well look inward before they look outward, and treat funders as partners with
        interests of their own.
      </p>
      <p>
        That takes time most people don't have: reading a funder's guidelines and past grants, going through asset registers line by line,
        working out where the two fit. Pippa does that reading, then hands the judgement back to you.
      </p>

      <h2>How it works</h2>
      <ol>
        <li>
          <strong>The Classroom</strong> holds your case from the course: the problem, the mission, the stakeholders, the value proposition.
        </li>
        <li>
          <strong>The Internal Resource Finder</strong> reads your own records for idle or underused capacity that could fund the work or
          count as co-financing.
        </li>
        <li>
          <strong>Funder Check</strong> reads a funder's own materials, scores the fit, checks eligibility, and says what your organisation
          can offer them.
        </li>
      </ol>

      <h2>What Pippa won't do</h2>
      <p>
        It won't make things up, write your proposal, or tell you what you want to hear. Every point it makes traces back to something you
        gave it. When there's no good opportunity, it says so.
      </p>

      <h2>The people behind it</h2>
      <div className="people">
        <div>
          <h3>Andras Vamos-Goldman</h3>
          <p>
            Canadian diplomat, international lawyer and social entrepreneur. He teaches at NYU's Center for Global Affairs and conceived
            Pippa as part of rethinking how social-impact organisations raise resources.
          </p>
        </div>
        <div>
          <h3>Maahi Gupta</h3>
          <p>
            Designed and built Pippa. She holds an M.S. in Transnational Security from NYU's Center for Global Affairs and works across
            research, policy and product design.
          </p>
        </div>
      </div>
    </article>
  );
}
