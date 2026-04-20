"use client";

import { useActionState } from "react";
import type {
  CreateClinicState,
  FormAction,
  InviteClinicMemberState,
} from "@/types/common";
import FormSubmit from "@/components/form-submit";
import style from "@/styles/components/clinic-manager.module.scss";

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
    <div className={style.page}>
      <section className={style.hero}>
        <div className={style.heroCopy}>
          <span className={style.eyebrow}>Rendelők</span>
          <h1>Rendelő kezelés és meghívások</h1>
          <p>
            Hozz létre új rendelőt, nézd meg az aktív helyet, és hívd meg a
            kollégákat ugyanabból a felületből.
          </p>
        </div>
      </section>

      <div className={style.grid}>
        <section className={style.panel}>
          <div className={style.panelHeader}>
            <h2>Új rendelő</h2>
            <span>Gyors létrehozás</span>
          </div>

          <form action={createAction} className={style.form}>
            <div className={style.field}>
              <label htmlFor="clinic-name">Rendelő neve</label>
              <input
                id="clinic-name"
                type="text"
                name="name"
                placeholder="Rendelő neve"
              />
            </div>

            {createState.error?.name.map((error) => (
              <p key={error} className={style.errorText}>
                {error}
              </p>
            ))}

            {createState.message && (
              <p className={style.statusText}>{createState.message}</p>
            )}

            <FormSubmit buttonText="Létrehozás" pendingText="Betöltés..." />
          </form>
        </section>

        <section className={style.panel}>
          <div className={style.panelHeader}>
            <h2>Rendelők</h2>
            <span>{clinics.length} darab</span>
          </div>

          {clinics.length === 0 && (
            <div className={style.emptyState}>Nincs még rendelőd.</div>
          )}

          {clinics.length > 0 && (
            <ul className={style.list}>
              {clinics.map((clinic) => (
                <li key={clinic.clinicId} className={style.listItem}>
                  <div className={style.listItemCopy}>
                    <strong>{clinic.clinicName}</strong>
                    <span>{clinic.clinicId}</span>
                  </div>
                  {clinic.clinicId === activeClinicId && (
                    <span className={style.activeBadge}>Aktív</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {activeClinicId && (
          <section className={style.panel}>
            <div className={style.panelHeader}>
              <h2>Tag meghívása</h2>
              <span>Aktív rendelőhöz</span>
            </div>

            <form action={inviteAction} className={style.form}>
              <input type="hidden" name="clinicId" value={activeClinicId} />
              <div className={style.field}>
                <label htmlFor="invite-email">Email cím</label>
                <input
                  id="invite-email"
                  type="email"
                  name="email"
                  placeholder="Email"
                />
              </div>

              {inviteState.error?.email.map((error) => (
                <p key={error} className={style.errorText}>
                  {error}
                </p>
              ))}

              {inviteState.message && (
                <p className={style.statusText}>{inviteState.message}</p>
              )}

              <FormSubmit buttonText="Meghívás" pendingText="Betöltés..." />
            </form>
          </section>
        )}
      </div>
    </div>
  );
}
