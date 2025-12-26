export const appointmentReminderBodyTemplate = `          <!-- Body content -->
          <tr>
            <td style="padding: 40px;">
              <!-- Appointment Information -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 25px; background-color: #f8f9fa; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 20px; border-left: 4px solid #558cc9;">
                    <h2 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 20px; font-weight: 600;">{{title}}</h2>
                    <p style="margin: 0 0 20px 0; color: #555; font-size: 14px; line-height: 1.6;">
                      Vous avez un rendez-vous prévu dans 24 heures.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Mission Information -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 25px; background-color: #f8f9fa; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 20px; border-left: 4px solid #82c4c1;">
                    <h2 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 20px; font-weight: 600;">Informations de la mission</h2>
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; color: #555; font-size: 14px;"><strong style="color: #2c3e50;">Titre:</strong></td>
                        <td style="padding: 8px 0; color: #333; font-size: 14px;">{{mission_title}}</td>
                      </tr>
                      {{#mission_description}}
                      <tr>
                        <td style="padding: 8px 0; color: #555; font-size: 14px; vertical-align: top;"><strong style="color: #2c3e50;">Description:</strong></td>
                        <td style="padding: 8px 0; color: #333; font-size: 14px;">{{mission_description}}</td>
                      </tr>
                      {{/mission_description}}
                      <tr>
                        <td style="padding: 8px 0; color: #555; font-size: 14px;"><strong style="color: #2c3e50;">Structure:</strong></td>
                        <td style="padding: 8px 0; color: #333; font-size: 14px;">{{structure_name}}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Appointment Details -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 25px; background-color: #e8f4f8; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 20px; border-left: 4px solid #558cc9;">
                    <h3 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 18px; font-weight: 600;">Détails du rendez-vous</h3>
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; color: #555; font-size: 14px;"><strong style="color: #2c3e50;">Date et heure:</strong></td>
                        <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">{{appointment_date_time}}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #555; font-size: 14px;"><strong style="color: #2c3e50;">Durée:</strong></td>
                        <td style="padding: 8px 0; color: #333; font-size: 14px;">{{appointment_duration}}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Reminder Note -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                <tr>
                  <td style="padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                    <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                      <strong>Rappel:</strong> Ce rendez-vous est prévu dans 24 heures. Assurez-vous d'être disponible et préparé.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

`;
