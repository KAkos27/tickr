"use client";

import { useActionState } from "react";
import type {
  CreateClinicState,
  FormAction,
  InviteClinicMemberState,
} from "@/types/common";
import FormSubmit from "@/components/form-submit";

type ClinicSummary = {
  clinicId: string;
  clinicName: string;
};

export default function ClinicManager({
  clinics,
  activeClinicId,
  createClinicAction,
  inviteClinicMemberAction,
}: {
  clinics: ClinicSummary[];
  activeClinicId: string | null;
  createClinicAction: FormAction<CreateClinicState>;
  inviteClinicMemberAction: FormAction<InviteClinicMemberState>;
}) {
  const [createState, createAction] = useActionState<
    CreateClinicState,
    FormData
  >(createClinicAction, {});
  const [inviteState, inviteAction] = useActionState<
    InviteClinicMemberState,
    FormData
  >(inviteClinicMemberAction, {});

  return (
    <div>
      <section>
        <h2>Uj rendelo</h2>
        <form action={createAction}>
          <input type="text" name="name" placeholder="Rendelo neve" />
          {createState.error?.name.map((error) => (
            <p key={error}>{error}</p>
          ))}
          {createState.message && <p>{createState.message}</p>}
          <FormSubmit buttonText="Letrehozas" pedingText="Betoltes..." />
        </form>
      </section>

      <section>
        <h2>Rendelok</h2>
        {clinics.length === 0 && <p>Nincs rendelod.</p>}
        {clinics.length > 0 && (
          <ul>
            {clinics.map((clinic) => (
              <li key={clinic.clinicId}>
                {clinic.clinicName}
                {clinic.clinicId === activeClinicId ? " (aktiv)" : ""}
              </li>
            ))}
          </ul>
        )}
      </section>

      {activeClinicId && (
        <section>
          <h2>Tag meghivasa</h2>
          <form action={inviteAction}>
            <input type="hidden" name="clinicId" value={activeClinicId} />
            <input type="email" name="email" placeholder="Email" />
            {inviteState.error?.email.map((error) => (
              <p key={error}>{error}</p>
            ))}
            {inviteState.message && <p>{inviteState.message}</p>}
            <FormSubmit buttonText="Meghivas" pedingText="Betoltes..." />
          </form>
        </section>
      )}
    </div>
  );
}
