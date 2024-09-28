import { useState, useEffect, useRef } from "react";
import { elements } from "@code-wallet/elements";
import type { CurrencyCode } from "@code-wallet/currency";

export default function App() {
  return (
    <div className="App">
      <div className="flex flex-col justify-center">
        <Task />
        <SubmissionList />
      </div>
    </div>
  );
}

function Task() {
  return (
    <div className="flex justify-center">
      <div className="m-3 h-auto max-h-[90%] w-full md:w-[60rem] overflow-y-auto rounded-3xl bg-indigo-300 p-4 shadow-2xl flex-initial">
        <p className="text-sm font-medium">
          This is where task definition is displayed task definition is
          displayed task definition is displayed task definition is displayed
          task definition is displayed task definition is displayed
        </p>
      </div>
    </div>
  );
}

interface ApiResponse {
  success: boolean;
  message: string;
  responseObject: object | null;
  statusCode: number;
}
interface CreateIntentResponse extends ApiResponse {
  responseObject: {
    amount: number;
    currency: string;
    destination: string;
    clientSecret: string;
  };
}
function SubmissionList() {
  const codeElement = useRef(null);
  // const codeBtnCreated = useRef(false);
  const [submissionId, setSubmissionId] = useState(0);

  useEffect(() => {
    let ignore = false; // good practice according to https://react.dev/learn/synchronizing-with-effects#fetching-data

    async function createCodeButton() {
      try {
        const res = await fetch(
          "http://localhost:8080/codewallet/create-intent",
          {
            method: "POST",
            body: "{}",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const result = (await res.json()) as CreateIntentResponse;

        const { amount, currency, destination, clientSecret } =
          result.responseObject;
        console.log("clientSecret: ", clientSecret);

        if (!ignore) {
          const { button } = elements.create("button", {
            amount,
            currency: currency as CurrencyCode,
            destination,
            clientSecret,
          });
          if (codeElement.current && button !== undefined) {
            button.mount(codeElement.current);
            // codeBtnCreated.current = true;
          } else {
            console.error("codeElement.current is null or undefined");
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
    createCodeButton().catch((reason) =>
      console.error("createCodeButton failed: ", reason)
    );

    return () => {
      ignore = true;
    };
  }, []);

  function handleVote(id: number) {
    // if (!codeBtnCreated.current) createCodeButton();
    setSubmissionId(id);
  }

  function cancelVote() {
    setSubmissionId(0);
  }

  return (
    <>
      <div
        className={`${submissionId === 0 ? "hidden" : ""} relative z-10`}
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
        ></div>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full justify-center p-4 text-center items-center sm:p-0">
            <div className="relative overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all m-8 w-full sm:max-w-lg">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="flex flex-col justify-center items-center">
                  <h3
                    className="text-base text-center font-semibold leading-6 text-gray-900"
                    id="modal-title"
                  >
                    Vote for id={submissionId}
                  </h3>
                  <div className="m-2">
                    <div ref={codeElement} />
                  </div>
                </div>
              </div>
              <div className="bg-gray-200 px-4 py-3 justify-around flex flex-row-reverse sm:px-6">
                <button
                  onClick={cancelVote}
                  className="inline-flex w-auto rounded-md bg-red-200 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-red-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Submission id={1} voteHandler={handleVote} />
      <Submission id={2} voteHandler={handleVote} />
      <Submission id={3} voteHandler={handleVote} />
    </>
  );
}

interface SubmissionProps {
  id: number;
  voteHandler: (id: number) => void;
}
function Submission({ id, voteHandler }: SubmissionProps) {
  return (
    <div className="flex justify-center">
      <div className="m-1 h-auto max-h-[90%] w-10/12 md:w-[55rem] overflow-y-auto rounded-3xl bg-indigo-600 p-4 shadow-2xl flex-initial">
        <div className="flex justify-start">
          <button
            className="Vote rounded-lg bg-cyan-500 p-2 text-sm font-bold text-cyan-900"
            onClick={() => voteHandler(id)}
          >
            <p className="text-nowrap">Vote</p>
          </button>
          <p className="pl-2 pr-2 pt-0 pb-0 text-sm font-medium  text-slate-100">
            This is where the submission details are displayed submission
            details are displayed submission details are displayed submission
            details are displayed
          </p>
        </div>
      </div>
    </div>
  );
}
